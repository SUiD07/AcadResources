import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

// Direct children of `parentPath` = rows whose PARENT path (r.folder_path)
// is exactly parentPath.
function directChildren(records: DriveSyncRecord[], parentPath: string): DriveSyncRecord[] {
  return records.filter((r) => r.folder_path === parentPath);
}

// ─── Descendant counting ────────────────────────────────────────────────────
// Instead of, for every folder, re-scanning ALL records to count how many
// live underneath it (O(records) per folder, repeated on every keystroke),
// we walk `records` ONCE and credit every ancestor path along the way.
// The result is a lookup table: descendantCountMap.get(folderPath) is an
// O(1) read. This only needs to be rebuilt when driveSyncRecords itself
// changes — never while the user is just typing.
function buildDescendantCountMap(records: DriveSyncRecord[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const r of records) {
    const parentPath = r.folder_path;
    if (!parentPath) continue; // top-level items have no parent folder to credit

    const segments = parentPath.split('>').map((s) => s.trim()).filter(Boolean);
    let current = '';
    for (let i = 0; i < segments.length; i++) {
      current = i === 0 ? segments[0] : `${current} > ${segments[i]}`;
      map.set(current, (map.get(current) ?? 0) + 1);
    }
  }

  return map;
}

function searchSuggestions(
  query: string,
  records: DriveSyncRecord[],
  foldersOnly: boolean,
  descendantCountMap: Map<string, number>,
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
    const childCount = isFolder ? (descendantCountMap.get(path) ?? 0) : 0;

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

function drillChildren(
  records: DriveSyncRecord[],
  parentPath: string,
  foldersOnly: boolean,
  descendantCountMap: Map<string, number>,
): SuggestionItem[] {
  const children = directChildren(records, parentPath);
  const seen = new Map<string, SuggestionItem>();

  for (const r of children) {
    const path = ownPath(r);
    if (seen.has(path)) continue;
    const isFolder = !!r.is_folder;
    if (foldersOnly && !isFolder) continue;
    const name = lastName(path);
    const childCount = isFolder ? (descendantCountMap.get(path) ?? 0) : 0;
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

  // Debounced copy of `value` — only updates ~150ms after typing pauses.
  // The <input> below still binds to `value` directly, so what's on
  // screen updates instantly; only the (expensive) search is delayed.
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  // Built once per driveSyncRecords change, reused across every keystroke.
  const descendantCountMap = useMemo(
    () => buildDescendantCountMap(driveSyncRecords),
    [driveSyncRecords],
  );

  const suggestions = useMemo(
    () =>
      open && !drill
        ? searchSuggestions(debouncedValue, driveSyncRecords, foldersOnly, descendantCountMap)
        : [],
    [open, drill, debouncedValue, driveSyncRecords, foldersOnly, descendantCountMap],
  );

  const drillItems = useMemo(
    () =>
      open && drill
        ? drillChildren(driveSyncRecords, drill.folderPath, foldersOnly, descendantCountMap)
        : [],
    [open, drill, driveSyncRecords, foldersOnly, descendantCountMap],
  );

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

      {showDropdown && createPortal(
        <>
          {/* Backdrop — dims the page and gives a click-away target */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.35)',
              zIndex: 9998,
            }}
          />

          {/* Centered panel — fixed to the viewport instead of anchored
              under the input, so it can never run off-screen regardless
              of where the input sits (e.g. inside a narrow modal). */}
          <div
            ref={dropRef}
            onMouseDown={handleDropdownMouseDown}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: 'min(640px, 92vw)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              border: '0.5px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
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
                  padding: '10px 14px',
                  background: 'var(--color-background-secondary)',
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  cursor: 'pointer',
                  flexShrink: 0,
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
                  padding: '10px 14px',
                  width: '100%',
                  border: 'none',
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  background: '#fff0f7',
                  cursor: 'pointer',
                  textAlign: 'left',
                  flexShrink: 0,
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
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto', flex: 1 }}>
              {(drill ? drillItems : suggestions).map((item) => (
                <li
                  key={item.fullPath}
                  style={{ display: 'flex', alignItems: 'stretch', borderTop: '0.5px solid var(--color-border-tertiary)' }}
                >
                  {/* Main row — for folders this ALWAYS drills in (explore).
                      It never selects on its own, so an ambiguous or
                      miscounted childCount can't accidentally pick a
                      folder when the user only meant to look inside it. */}
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-background-secondary)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    onClick={() => {
                      if (item.isFolder) {
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
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)', fontWeight: item.isFolder ? 500 : 400, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    {item.parentCrumb && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0, paddingLeft: 8, maxWidth: '35%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.parentCrumb}
                      </span>
                    )}
                    {item.isFolder && (
                      <ChevronRight size={13} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                    )}
                  </button>

                  {/* Explicit select button — the only way to choose a
                      folder as the key. Keeps "explore" and "select" as
                      two clearly separate actions. */}
                  {item.isFolder && (
                    <button
                      title={`Use "${item.name}"`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 12px',
                        border: 'none',
                        borderLeft: '0.5px solid var(--color-border-tertiary)',
                        background: 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff0f7')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      onClick={() => selectItem(item)}
                    >
                      <FolderCheck size={15} style={{ color: '#E5007D' }} />
                    </button>
                  )}
                </li>
              ))}

              {(drill ? drillItems : suggestions).length === 0 && (
                <li style={{ padding: '16px', fontSize: 13, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                  {drill ? 'No subfolders here.' : 'No matches found.'}
                </li>
              )}
            </ul>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}