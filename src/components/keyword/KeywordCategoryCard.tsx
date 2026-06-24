import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Loader2, Plus, Trash2, Save, X,
  Folder, FolderPlus, ChevronRight, ChevronDown, FileText,
} from 'lucide-react';
import type { KeywordConfig, StudentDocument, DriveSyncRecord } from '../../lib/types';
import { getMatchingFiles, getMatchingFilesExcludingKey } from '../../lib/KeywordMatching';
import {
  getDriveSyncFolderPaths,
  isDriveSyncFolderKey,
  buildScopedDriveTree,
  type DriveTreeNode,
} from '../../lib/DriveTree';
import { KeywordAutocomplete } from './KeywordAutocomplete';

interface FocusedKey {
  configId: string;
  keyIndex: number;
}

interface KeywordCategoryCardProps {
  config: KeywordConfig;
  documents: StudentDocument[];
  driveSyncRecords: DriveSyncRecord[];
  activeTab: KeywordConfig['config_type'];
  isSaving: boolean;
  focusedKey: FocusedKey | null;
  onUpdateConfig: (id: string, updates: Partial<KeywordConfig>) => void;
  onAddKey: (id: string) => void;
  onUpdateKey: (id: string, keyIndex: number, value: string) => void;
  onRemoveKey: (id: string, keyIndex: number) => void;
  onFocusKey: (configId: string, keyIndex: number) => void;
  onBlurKey: () => void;
  onSave: (config: KeywordConfig) => void;
  onDelete: (id: string) => void;
}

// ─── Sub-components (unchanged from original) ────────────────────────────────

function FileList({ files, emptyLabel, dimmed = false }: {
  files: StudentDocument[];
  emptyLabel: string;
  dimmed?: boolean;
}) {
  if (files.length === 0) {
    return <p className="p-4 text-sm text-slate-400 italic">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '10rem' }}>
      {files.map((doc) => (
        <li key={doc.id} className={`p-3 flex items-start gap-3 hover:bg-slate-50 ${dimmed ? 'opacity-60' : ''}`}>
          <div>
            <p className={`text-sm font-medium ${dimmed ? 'text-slate-700' : 'text-slate-900'}`}>{doc.title}</p>
            <p className={`text-xs font-mono truncate ${dimmed ? 'text-slate-400' : 'text-slate-500'}`}>{doc.folder_path}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DriveTreeRow({ node, depth }: { node: DriveTreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  return (
    <li>
      <div
        className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-50 ${node.isFolder ? 'cursor-pointer' : ''}`}
        style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
        onClick={() => node.isFolder && hasChildren && setExpanded((e) => !e)}
      >
        {node.isFolder ? (
          hasChildren ? (
            expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : <span className="w-3.5 h-3.5 shrink-0" />
        ) : <span className="w-3.5 h-3.5 shrink-0" />}
        {node.isFolder
          ? <Folder className="w-4 h-4 text-[#E5007D] shrink-0" />
          : <FileText className="w-4 h-4 text-slate-400 shrink-0" />}
        <span className={`text-sm truncate ${node.isFolder ? 'font-medium text-slate-700' : 'text-slate-600'}`}>
          {node.name}
        </span>
      </div>
      {node.isFolder && hasChildren && expanded && (
        <ul>
          {node.children.map((child) => <DriveTreeRow key={child.fullPath} node={child} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );
}

function DriveTreeView({ root }: { root: DriveTreeNode }) {
  if (root.children.length === 0) {
    return <p className="p-4 text-sm text-slate-400 italic">This folder is empty.</p>;
  }
  return (
    <ul className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: '20rem' }}>
      {root.children.map((child) => <DriveTreeRow key={child.fullPath} node={child} depth={0} />)}
    </ul>
  );
}

// ─── Add Folder button with inline autocomplete ───────────────────────────────
/**
 * Renders as a dashed "Add Folder" button.
 * On click it opens an inline chip with a folders-only KeywordAutocomplete.
 * Selecting a folder fires onAdd(fullPath) and collapses back to the button.
 */
function AddFolderAutocomplete({
  driveSyncRecords,
  documents,
  onAdd,
}: {
  driveSyncRecords: DriveSyncRecord[];
  documents: StudentDocument[];
  onAdd: (folderPath: string) => void;
}) {
  const [active, setActive] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleCommit = useCallback(
    (folderPath: string) => {
      if (folderPath.trim()) onAdd(folderPath.trim());
      setInputValue('');
      setActive(false);
    },
    [onAdd],
  );

  const handleBlur = useCallback(() => {
    // Small delay so a dropdown click registers before we collapse
    setTimeout(() => {
      setActive(false);
      setInputValue('');
    }, 200);
  }, []);

  if (!active) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 border-dashed border-2 border-slate-200 hover:border-[#E5007D] hover:text-[#E5007D] hover:bg-pink-50 gap-2"
        onClick={() => setActive(true)}
      >
        <FolderPlus className="w-4 h-4" />
        Add Folder
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-[#E5007D] rounded-lg pl-3 pr-1 py-1">
      <Folder className="w-3.5 h-3.5 text-[#E5007D] shrink-0" />
      <KeywordAutocomplete
        value={inputValue}
        driveSyncRecords={driveSyncRecords}
        documents={documents}
        placeholder="Search folders…"
        foldersOnly
        onChange={setInputValue}
        onCommit={handleCommit}
        onBlur={handleBlur}
        // Auto-open the dropdown as soon as the chip appears
        // (the input will call onFocus → setOpen(true) on mount via autoFocus)
        className="min-w-[160px]"
        autoFocus
      />
      <button
        onClick={() => { setActive(false); setInputValue(''); }}
        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main card ───────────────────────────────────────────────────────────────

export function KeywordCategoryCard({
  config,
  documents,
  driveSyncRecords,
  activeTab,
  isSaving,
  focusedKey,
  onUpdateConfig,
  onAddKey,
  onUpdateKey,
  onRemoveKey,
  onFocusKey,
  onBlurKey,
  onSave,
  onDelete,
}: KeywordCategoryCardProps) {
  const isFocusedHere = focusedKey?.configId === config.id;
  const matchingFiles = getMatchingFiles(documents, config, isFocusedHere ? focusedKey.keyIndex : undefined);
  const beforeKeyFiles = isFocusedHere
    ? getMatchingFilesExcludingKey(documents, config, focusedKey.keyIndex)
    : [];

  const driveFolderPaths = getDriveSyncFolderPaths(driveSyncRecords);

  // Append a folder path as a new key (called by AddFolderAutocomplete)
  const handleAddFolder = useCallback(
    (folderPath: string) => {
      const alreadyExists = config.keys.some(
        (k) => k.trim().toLowerCase() === folderPath.toLowerCase(),
      );
      if (!alreadyExists) {
        onUpdateConfig(config.id, { keys: [...config.keys, folderPath] });
      }
    },
    [config.id, config.keys, onUpdateConfig],
  );

  const focusedKeyValue = isFocusedHere ? config.keys[focusedKey.keyIndex] : undefined;
  const showTreeForFocusedKey =
    isFocusedHere &&
    focusedKeyValue !== undefined &&
    isDriveSyncFolderKey(focusedKeyValue, driveFolderPaths);
  const scopedTree = showTreeForFocusedKey
    ? buildScopedDriveTree(driveSyncRecords, focusedKeyValue!)
    : null;

  return (
    <div className="p-6 border border-slate-200 rounded-2xl space-y-6 bg-white hover:border-pink-200 transition-colors">
      {/* ── Header row ── */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Display Label</Label>
            <Input
              className="bg-white"
              value={config.label}
              onChange={(e) => onUpdateConfig(config.id, { label: e.target.value })}
            />
          </div>
          {activeTab === 'block_mapping' && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Curriculum Year</Label>
              <Select value={config.year} onValueChange={(val) => onUpdateConfig(config.id, { year: val })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['1','2','3','4','5','6'].map((y) => (
                    <SelectItem key={y} value={y}>Year {y}</SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200"
            onClick={() => onDelete(config.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            className="bg-[#E5007D] hover:bg-[#c00069] text-white px-6"
            onClick={() => onSave(config)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Keywords ── */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          Matching Keywords
          <span className="text-xs font-normal text-slate-400 italic">(Case-insensitive)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {/* Existing keyword chips — plain text inputs, unchanged from original */}
          {config.keys.map((key, idx) => {
            const isFolder = isDriveSyncFolderKey(key, driveFolderPaths);
            return (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg pl-3 pr-1 py-1 group focus-within:border-[#E5007D] transition-colors"
                title={isFolder ? 'Matches this folder and all its subfolders' : undefined}
              >
                {isFolder && <Folder className="w-3.5 h-3.5 text-[#E5007D] shrink-0" />}
                <input
                  className="bg-transparent text-sm focus:outline-none min-w-[120px] text-slate-600"
                  value={key}
                  onChange={(e) => onUpdateKey(config.id, idx, e.target.value)}
                  onFocus={() => onFocusKey(config.id, idx)}
                  onBlur={onBlurKey}
                  placeholder="Type keyword…"
                />
                <button
                  onClick={() => onRemoveKey(config.id, idx)}
                  className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Add Key — plain text, no autocomplete (unchanged behaviour) */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-dashed border-2 hover:border-[#E5007D] hover:text-[#E5007D] hover:bg-pink-50"
            onClick={() => onAddKey(config.id)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Key
          </Button>

          {/*
            Add Folder — replaced the static <Select> with an inline
            folders-only autocomplete that supports drill-down navigation.
          */}
          <AddFolderAutocomplete
            driveSyncRecords={driveSyncRecords}
            documents={documents}
            onAdd={handleAddFolder}
          />
        </div>
        <p className="text-xs text-slate-400">
          A folder key tags every file in that folder — including subfolders — with this category.
        </p>
      </div>

      {/* ── Matching files panel (unchanged) ── */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        {showTreeForFocusedKey ? (
          <>
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#E5007D]" />
              Folder Contents — "{focusedKeyValue}"
            </Label>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {scopedTree
                ? <DriveTreeView root={scopedTree} />
                : <p className="p-4 text-sm text-slate-400 italic">This folder couldn't be found in Drive anymore.</p>}
            </div>
            <p className="text-xs text-slate-400">
              Showing the live folder structure from Drive. Every file under this folder (including subfolders) is tagged with this category.
            </p>
          </>
        ) : isFocusedHere ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                With "{config.keys[focusedKey.keyIndex] || '…'}" ({matchingFiles.length})
              </Label>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <FileList files={matchingFiles} emptyLabel="No matching files found." />
              </div>
            </div>
            <div className="space-y-2 md:border-l md:border-slate-100 md:pl-4">
              <Label className="text-sm font-semibold text-slate-400">
                Before This Key ({beforeKeyFiles.length})
              </Label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <FileList files={beforeKeyFiles} emptyLabel="No files matched without this key." dimmed />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Label className="text-sm font-semibold text-slate-700">
              Matching Files ({matchingFiles.length})
            </Label>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <FileList files={matchingFiles} emptyLabel="No matching files found." />
            </div>
          </>
        )}
      </div>
    </div>
  );
}