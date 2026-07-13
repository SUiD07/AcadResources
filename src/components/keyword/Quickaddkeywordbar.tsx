import { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Zap } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import type { KeywordConfig, StudentDocument } from '../../lib/types';
import { getFilesMatchingKeyword, getFilesNotMatchingKeyword } from '../../lib/KeywordMatching';

interface QuickAddKeywordBarProps {
  documents: StudentDocument[];
  configs: KeywordConfig[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  type: KeywordConfig['config_type'];
  onTypeChange: (value: KeywordConfig['config_type']) => void;
  categoryId: string;
  onCategoryIdChange: (value: string) => void;
  newLabel: string;
  onNewLabelChange: (value: string) => void;
  newYear: string;
  onNewYearChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

// ─── Shared virtualized file list ───────────────────────────────────────────
// Replaces plain `.map()` over an unbounded array. `maxHeight` alone never
// stopped React from mounting every matching row — it only made the
// overflow scroll. Virtuoso only mounts the rows actually in view, so a
// keyword matching hundreds/thousands of docs stays cheap to render.
function VirtualFileList({
  files,
  emptyLabel,
  heightRem,
  dimmed = false,
}: {
  files: StudentDocument[];
  emptyLabel: string;
  heightRem: number;
  dimmed?: boolean;
}) {
  if (files.length === 0) {
    return <p className="p-3 text-sm italic text-slate-400">{emptyLabel}</p>;
  }
  return (
    <Virtuoso
      style={{ height: `${heightRem}rem` }}
      data={files}
      itemContent={(index, doc) => (
        <li
          key={doc.id}
          className={`p-2 px-3 min-w-0 border-t border-slate-100 ${dimmed ? 'opacity-60 bg-slate-50' : 'bg-pink-50/50'}`}
        >
          <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
          <p className="text-xs font-mono text-slate-500 truncate">{doc.folder_path}</p>
        </li>
      )}
    />
  );
}

export function QuickAddKeywordBar({
  documents,
  configs,
  keyword,
  onKeywordChange,
  type,
  onTypeChange,
  categoryId,
  onCategoryIdChange,
  newLabel,
  onNewLabelChange,
  newYear,
  onNewYearChange,
  isSubmitting,
  onSubmit,
}: QuickAddKeywordBarProps) {
  const categoryOptions = useMemo(() => configs.filter((c) => c.config_type === type), [configs, type]);
  const matchingFiles = useMemo(() => getFilesMatchingKeyword(documents, keyword), [documents, keyword]);
  const nonMatchingFiles = useMemo(() => getFilesNotMatchingKeyword(documents, keyword), [documents, keyword]);
  const isCreatingNew = categoryId === 'NEW';

  return (
    <Card>
      <CardContent className="p-4 sm:p-5 space-y-4 min-w-0">
        <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#E5007D]" />
          Quick Add Keyword
        </Label>

        <div className="flex flex-col gap-3 md:flex-row md:items-end min-w-0">
          <div className="flex-1 min-w-0">
            <Input
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Type a keyword..."
            />
          </div>

          <div className="w-full md:w-48 min-w-0">
            <Select
              value={type}
              onValueChange={(val) => onTypeChange(val as KeywordConfig['config_type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doc_type">Document Type</SelectItem>
                <SelectItem value="block_mapping">Block Mapping</SelectItem>
                <SelectItem value="board_exam">Board Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-56 min-w-0">
            <Select value={categoryId} onValueChange={onCategoryIdChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">+ New Category</SelectItem>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isCreatingNew && (
            <Button
              className="w-full md:w-auto px-6 shrink-0 bg-[#E5007D] hover:bg-[#c00069] text-white"
              onClick={onSubmit}
              disabled={isSubmitting || !keyword.trim() || !categoryId}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add
            </Button>
          )}
        </div>

        {isCreatingNew && (
          <div className="flex flex-col gap-3 md:flex-row md:items-end pt-3 border-t border-slate-100 min-w-0">
            <div className="flex-1 min-w-0">
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">
                New category label
              </Label>
              <Input
                value={newLabel}
                onChange={(e) => onNewLabelChange(e.target.value)}
                placeholder="e.g. Lab Manual"
              />
            </div>

            {type === 'block_mapping' && (
              <div className="w-full md:w-40 min-w-0">
                <Label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Curriculum Year
                </Label>
                <Select value={newYear} onValueChange={onNewYearChange}>
                  <SelectTrigger>
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

            <Button
              className="w-full md:w-auto px-6 shrink-0 bg-[#E5007D] hover:bg-[#c00069] text-white"
              onClick={onSubmit}
              disabled={isSubmitting || !keyword.trim() || !newLabel.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create & Add
            </Button>
          </div>
        )}

        {keyword.trim() && (
          <div className="pt-3 border-t border-slate-100 min-w-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label className="text-xs font-semibold text-slate-600">
                  Matching "{keyword.trim()}" ({matchingFiles.length})
                </Label>
                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <VirtualFileList
                    files={matchingFiles}
                    emptyLabel="No matching files found."
                    heightRem={8}
                  />
                </div>
              </div>

              <div className="space-y-2 min-w-0 md:pl-4">
                <Label className="text-xs font-semibold text-slate-600">
                  Other Files ({nonMatchingFiles.length})
                </Label>
                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <VirtualFileList
                    files={nonMatchingFiles}
                    emptyLabel="No other files."
                    heightRem={8}
                    dimmed
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}