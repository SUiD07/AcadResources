import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
import type { KeywordConfig, StudentDocument } from '../../lib/types';
import { getMatchingFiles, getMatchingFilesExcludingKey } from '../../lib/KeywordMatching';

interface FocusedKey {
  configId: string;
  keyIndex: number;
}

interface KeywordCategoryCardProps {
  config: KeywordConfig;
  documents: StudentDocument[];
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

function FileList({
  files,
  emptyLabel,
  dimmed = false,
}: {
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
        <li
          key={doc.id}
          className={`p-3 flex items-start gap-3 hover:bg-slate-50 ${dimmed ? 'opacity-60' : ''}`}
        >
          <div>
            <p className={`text-sm font-medium ${dimmed ? 'text-slate-700' : 'text-slate-900'}`}>
              {doc.title}
            </p>
            <p className={`text-xs font-mono truncate ${dimmed ? 'text-slate-400' : 'text-slate-500'}`}>
              {doc.folder_path}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function KeywordCategoryCard({
  config,
  documents,
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

  return (
    <div className="p-6 border border-slate-200 rounded-2xl space-y-6 bg-white hover:border-pink-200 transition-colors">
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
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                  <SelectItem value="5">Year 5</SelectItem>
                  <SelectItem value="6">Year 6</SelectItem>
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

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          Matching Keywords
          <span className="text-xs font-normal text-slate-400 italic">(Case-insensitive)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {config.keys.map((key, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg pl-3 pr-1 py-1 group focus-within:border-[#E5007D] transition-colors"
            >
              <input
                className="bg-transparent text-sm focus:outline-none min-w-[120px] text-slate-600"
                value={key}
                onChange={(e) => onUpdateKey(config.id, idx, e.target.value)}
                onFocus={() => onFocusKey(config.id, idx)}
                onBlur={onBlurKey}
                placeholder="Type keyword..."
              />
              <button
                onClick={() => onRemoveKey(config.id, idx)}
                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-dashed border-2 hover:border-[#E5007D] hover:text-[#E5007D] hover:bg-pink-50"
            onClick={() => onAddKey(config.id)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Key
          </Button>
        </div>
      </div>

      {/* Matching Files List */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        {isFocusedHere ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                With "{config.keys[focusedKey.keyIndex] || '...'}" ({matchingFiles.length})
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