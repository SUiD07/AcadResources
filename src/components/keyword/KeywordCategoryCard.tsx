import { useState, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
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

function lastSegment(path: string): string {
  const sep = path.includes(' > ') ? ' > ' : '/';
  const parts = path.split(sep).map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

function FileList({ files, emptyLabel, dimmed = false }: {
  files: StudentDocument[];
  emptyLabel: string;
  dimmed?: boolean;
}) {
  if (files.length === 0) {
    return <p className="p-4 text-sm italic text-slate-400">{emptyLabel}</p>;
  }
  return (
    <ul className="overflow-y-auto divide-y divide-slate-100" style={{ maxHeight: '10rem' }}>
      {files.map((doc) => (
        <li key={doc.id} className={`p-3 flex items-start gap-3 min-w-0 ${dimmed ? 'opacity-60 bg-slate-50' : 'bg-pink-50/40'}`}>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
            <p className="text-xs font-mono text-slate-500 truncate">{doc.folder_path}</p>
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
        className={`flex items-center gap-2 px-3 py-2 min-w-0 hover:bg-slate-50 ${node.isFolder ? 'cursor-pointer' : ''}`}
        style={{ paddingLeft: `${0.75 + depth * 1.25}rem` }}
        onClick={() => node.isFolder && hasChildren && setExpanded((e) => !e)}
      >
        {node.isFolder ? (
          hasChildren ? (
            expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          ) : <span className="w-3.5 h-3.5 shrink-0" />
        ) : <span className="w-3.5 h-3.5 shrink-0" />}
        {node.isFolder
          ? <Folder className="w-4 h-4 shrink-0 text-[#E5007D]" />
          : <FileText className="w-4 h-4 shrink-0 text-slate-400" />}
        <span className={`text-sm truncate ${node.isFolder ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
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
    return <p className="p-4 text-sm italic text-slate-400">This folder is empty.</p>;
  }
  return (
    <ul className="overflow-y-auto divide-y divide-slate-100" style={{ maxHeight: '20rem' }}>
      {root.children.map((child) => <DriveTreeRow key={child.fullPath} node={child} depth={0} />)}
    </ul>
  );
}

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
        className="h-9 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
        onClick={() => setActive(true)}
      >
        <FolderPlus className="w-4 h-4" />
        Add Folder
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 pl-3 pr-1 py-1 min-w-0 rounded-full bg-slate-50 border border-slate-200">
      <Folder className="w-3.5 h-3.5 shrink-0 text-[#E5007D]" />
      <KeywordAutocomplete
        value={inputValue}
        driveSyncRecords={driveSyncRecords}
        documents={documents}
        placeholder="Search folders…"
        foldersOnly
        onChange={setInputValue}
        onCommit={handleCommit}
        onBlur={handleBlur}
        className="min-w-[160px]"
        autoFocus
      />
      <button
        onClick={() => { setActive(false); setInputValue(''); }}
        className="p-1 text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

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
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6 min-w-0">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">Display Label</Label>
              <Input
                value={config.label}
                onChange={(e) => onUpdateConfig(config.id, { label: e.target.value })}
              />
            </div>
            {activeTab === 'block_mapping' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Curriculum Year</Label>
                <Select value={config.year} onValueChange={(val) => onUpdateConfig(config.id, { year: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
          <div className="flex gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => onDelete(config.id)}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onSave(config)}
              disabled={isSaving}
              className="flex-1 md:flex-none bg-[#E5007D] hover:bg-[#c00069] text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-3 min-w-0">
          <Label className="text-sm font-semibold text-slate-900 flex items-center justify-between">
            Matching Keywords
            <span className="text-xs font-normal italic text-slate-400">(Case-insensitive)</span>
          </Label>
          <div className="flex flex-wrap gap-2 min-w-0">
            {config.keys.map((key, idx) => {
              const isFolder = isDriveSyncFolderKey(key, driveFolderPaths);
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 pl-3 pr-1 py-1 group max-w-[240px] rounded-full border ${
                    isFolder ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-slate-200'
                  }`}
                  title={isFolder ? key : undefined}
                >
                  {isFolder && <Folder className="w-3.5 h-3.5 shrink-0 text-[#E5007D]" />}

                  {isFolder ? (
                    <span
                      className="text-sm text-slate-700 truncate cursor-default select-none"
                      tabIndex={0}
                      onFocus={() => onFocusKey(config.id, idx)}
                      onBlur={onBlurKey}
                    >
                      {lastSegment(key)}
                    </span>
                  ) : (
                    <input
                      className="bg-transparent text-sm text-slate-700 focus:outline-none w-[140px]"
                      value={key}
                      onChange={(e) => onUpdateKey(config.id, idx, e.target.value)}
                      onFocus={() => onFocusKey(config.id, idx)}
                      onBlur={onBlurKey}
                      placeholder="Type keyword…"
                    />
                  )}

                  <button
                    onClick={() => onRemoveKey(config.id, idx)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => onAddKey(config.id)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Key
            </Button>

            <AddFolderAutocomplete
              driveSyncRecords={driveSyncRecords}
              documents={documents}
              onAdd={handleAddFolder}
            />
          </div>
          <p className="text-xs text-slate-500">
            A folder key tags every file in that folder — including subfolders — with this category.
            Hover a folder chip to see its full path.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 min-w-0">
          {showTreeForFocusedKey ? (
            <>
              <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Folder className=" w-4 h-4 text-[#E5007D] pl-2" />
                Folder Contents — "{lastSegment(focusedKeyValue!)}"
              </Label>
              <div className="min-w-0 overflow-hidden rounded-lg border border-slate-100">
                {scopedTree
                  ? <DriveTreeView root={scopedTree} />
                  : <p className="p-4 text-sm italic text-slate-400">This folder couldn't be found in Drive anymore.</p>}
              </div>
              <p className="text-xs text-slate-500">
                Full path: <span className="font-mono break-all text-slate-600">{focusedKeyValue}</span>
              </p>
            </>
          ) : isFocusedHere ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label className="text-sm font-semibold text-slate-900">
                  With "{config.keys[focusedKey.keyIndex] || '…'}" ({matchingFiles.length})
                </Label>
                <div className="min-w-0 overflow-hidden rounded-lg border border-slate-100">
                  <FileList files={matchingFiles} emptyLabel="No matching files found." />
                </div>
              </div>
              <div className="space-y-2 min-w-0 md:pl-4">
                <Label className="text-sm font-semibold text-slate-900">
                  Before This Key ({beforeKeyFiles.length})
                </Label>
                <div className="min-w-0 overflow-hidden rounded-lg border border-slate-100">
                  <FileList files={beforeKeyFiles} emptyLabel="No files matched without this key." dimmed />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Label className="text-sm font-semibold text-slate-900">
                Matching Files ({matchingFiles.length})
              </Label>
              <div className="min-w-0 overflow-hidden rounded-lg border border-slate-100">
                <FileList files={matchingFiles} emptyLabel="No matching files found." />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}