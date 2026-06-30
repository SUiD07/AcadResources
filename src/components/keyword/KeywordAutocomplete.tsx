import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Folder, File, ChevronRight, ArrowLeft, FolderCheck } from 'lucide-react';
import type { DriveSyncRecord, StudentDocument } from '../../lib/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SuggestionItem {
  fullPath: string;
  name: string;
  parentCrumb: string;
  isFolder: boolean;
  childCount: number;
}

interface DrillState {
  folderPath: string;
  folderName: string;
}

interface KeywordAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  driveSyncRecords: DriveSyncRecord[];
  documents: StudentDocument[];
  placeholder?: string;
  className?: string;
  foldersOnly?: boolean;
  autoFocus?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lastName(path: string): string {
  const parts = path.split('>').map((s) => s.trim());
  return parts[parts.length - 1] ?? path;
}

function parentCrumb(path: string): string {
  const parts = path.split('>').map((s) => s.trim());
  if (parts.length <= 1) return '';
  return parts.slice(0, -1).join(' > ');
}

// IMPORTANT: `r.folder_path` on a DriveSyncRecord is the path of the row's
// PARENT folder, not the row's own path. A row's own full path is its
// parent's path plus its own title. Earlier logic conflated these two
// things (filtering/keying directly on `folder_path`), which meant a
// folder's own identity was never actually being compared against —
// only its parent's — so folders nested one level deeper than expected
// (e.g. "Summary 3A1" sitting alongside "Summary 2B"/"Midterm 1B"/"Final 1B"
// as siblings under the same parent) could silently fail isFolder checks
// or child-count lookups depending on naming coincidences.
function ownPath(r: DriveSyncRecord): string {
  return r.folder_path ? `${r.folder_path} > ${r.title}` : r.title;
}

// Builds a lookup of every row's OWN full path -> is_folder, so we can
// correctly answer "is the thing AT this path a folder" rather than
// "is this path someone's parent".
function buildOwnPathFolderMap(records: DriveSyncRecord[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const r of records) {
    map.set(ownPath(r), !!r.is_folder);
  }
  return map;
}

// Direct children of `parentPath` = rows whose PARENT path (r.folder_path)
// is exactly parentPath. This part was already correct in the original —
// folder_path genuinely is the parent path, so an exact match here is
// the right check. The bug was downstream, in how isFolder/childCount
// were computed from that point on.
function directChildren(records: DriveSyncRecord[], parentPath: string): DriveSyncRecord[] {
  return records.filter((r) => r.folder_path === parentPath);
}

function countDescendants(records: DriveSyncRecord[], ownFullPath: string): number {
  const prefix = ownFullPath + ' > ';
  // A row is a descendant of `ownFullPath` if its PARENT path is either
  // ownFullPath itself, or nested further under it.
  return records.filter(
    (r) => r.folder_path === ownFullPath || r.folder_path.startsWith(prefix),
  ).length;
}

function searchSuggestions(
  query: string,
  records: DriveSyncRecord[],
  foldersOnly: boolean,
): SuggestionItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Map<string, SuggestionItem>();

  for (const r of records) {
    const path = ownPath(r);
    if (seen.has(path)) continue;
    if (!path.toLowerCase().includes(q)) continue;

    const isFolder = !!r.is_folder;
    if (foldersOnly && !isFolder) continue;

    const name = lastName(path);
    const childCount = isFolder ? countDescendants(records, path) : 0;

    seen.set(path, { fullPath: path, name, parentCrumb: parentCrumb(path), isFolder, childCount });
  }

  const items = Array.from(seen.values());
  items.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase().includes(q) ? 0 : 1;
    const bNameMatch = b.name.toLowerCase().includes(q) ? 0 : 1;
    if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch;
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.fullPath.split('>').length - b.fullPath.split('>').length;
  });

  return items.slice(0, 12);
}

function drillChildren(records: DriveSyncRecord[], parentPath: string, foldersOnly: boolean): SuggestionItem[] {
  const children = directChildren(records, parentPath);
  const seen = new Map<string, SuggestionItem>();

  for (const r of children) {
    const path = ownPath(r);
    if (seen.has(path)) continue;
    const isFolder = !!r.is_folder;
    if (foldersOnly && !isFolder) continue;
    const name = lastName(path);
    const childCount = isFolder ? countDescendants(records, path) : 0;
    seen.set(path, {
      fullPath: path,
      name,
      parentCrumb: parentCrumb(path),
      isFolder,
      childCount,
    });
  }

  const items = Array.from(seen.values());
  items.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return items.slice(0, 20);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function KeywordAutocomplete({
  value,
  onChange,
  onCommit,
  onFocus,
  onBlur,
  driveSyncRecords,
  placeholder = 'Type keyword…',
  className = '',
  foldersOnly = false,
  autoFocus = false,
}: KeywordAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [drill, setDrill] = useState<DrillState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = open && !drill ? searchSuggestions(value, driveSyncRecords, foldersOnly) : [];
  const drillItems = open && drill ? drillChildren(driveSyncRecords, drill.folderPath, foldersOnly) : [];
  const showDropdown = open && (suggestions.length > 0 || drill !== null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setDrill(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setDrill(null);
      setOpen(true);
    },
    [onChange],
  );

  const handleInputFocus = useCallback(() => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setOpen(true);
    onFocus?.();
  }, [onFocus]);

  const handleInputBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => {
      setOpen(false);
      setDrill(null);
      onBlur?.();
    }, 150);
  }, [onBlur]);

  const handleDropdownMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const selectItem = useCallback(
    (item: SuggestionItem) => {
      onCommit(item.fullPath);
      setOpen(false);
      setDrill(null);
      inputRef.current?.blur();
    },
    [onCommit],
  );

  const drillInto = useCallback((item: SuggestionItem) => {
    setDrill({ folderPath: item.fullPath, folderName: item.name });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions.length > 0) {
          selectItem(suggestions[0]);
        } else {
          onCommit(value);
          setOpen(false);
        }
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setDrill(null);
      }
    },
    [suggestions, value, onCommit, selectItem],
  );

  // ── Portal positioning ──────────────────────────────────────────────────────
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!showDropdown || !inputRef.current) { setDropPos(null); return; }
    const rect = inputRef.current.getBoundingClientRect();
    setDropPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
  }, [showDropdown]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        ref={inputRef}
        className={`bg-transparent text-sm focus:outline-none min-w-[120px] text-slate-600 ${className}`}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
      />

      {showDropdown && dropPos && createPortal(
        <div
          ref={dropRef}
          onMouseDown={handleDropdownMouseDown}
          style={{
            position: 'absolute',
            top: dropPos.top,
            left: dropPos.left,
            zIndex: 9999,
            width: 'max-content',
            minWidth: '480px',
            maxWidth: '720px',
            background: 'white',
            border: '0.5px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Drill header / back button */}
          {drill && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--color-background-secondary)',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
                cursor: 'pointer',
              }}
              onClick={() => setDrill(null)}
            >
              <ArrowLeft size={13} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {drill.folderName}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>back</span>
            </div>
          )}

          {/* "Use this folder" pinned option while drilling */}
          {drill && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                width: '100%',
                border: 'none',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
                background: '#fff0f7',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onClick={() =>
                selectItem({ fullPath: drill.folderPath, name: drill.folderName, parentCrumb: '', isFolder: true, childCount: 0 })
              }
            >
              <FolderCheck size={15} style={{ color: '#E5007D', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#E5007D', fontWeight: 500 }}>
                Use &ldquo;{drill.folderName}&rdquo;
              </span>
            </button>
          )}

          {/* Suggestion list */}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '280px', overflowY: 'auto' }}>
            {(drill ? drillItems : suggestions).map((item) => (
              <li key={item.fullPath} style={{ borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 12px',
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-background-secondary)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  onClick={() => {
                    if (item.isFolder && item.childCount > 0) {
                      drillInto(item);
                    } else {
                      selectItem(item);
                    }
                  }}
                >
                  {item.isFolder ? (
                    <Folder size={15} style={{ color: '#E5007D', flexShrink: 0 }} />
                  ) : (
                    <File size={15} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', fontWeight: item.isFolder ? 500 : 400, whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                  {item.parentCrumb && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0, paddingLeft: 8 }}>
                      {item.parentCrumb}
                    </span>
                  )}
                  {item.isFolder && item.childCount > 0 && (
                    <ChevronRight size={13} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                  )}
                </button>
              </li>
            ))}

            {(drill ? drillItems : suggestions).length === 0 && (
              <li style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                {drill ? 'No subfolders here.' : 'No matches found.'}
              </li>
            )}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}