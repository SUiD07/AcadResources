import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus } from 'lucide-react';
import type { KeywordConfig, StudentDocument } from '../../lib/types';
import { getFilesMatchingKeyword, getFilesNotMatchingKeyword } from '../../lib/KeywordMatching';

interface QuickAddKeywordBarProps {
  documents: StudentDocument[];
  configs: KeywordConfig[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  type: KeywordConfig['config_type'];
  onTypeChange: (value: KeywordConfig['config_type']) => void;
  categoryId: string; // '' = unselected, 'NEW' = new category
  onCategoryIdChange: (value: string) => void;
  newLabel: string;
  onNewLabelChange: (value: string) => void;
  newYear: string;
  onNewYearChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
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
  const categoryOptions = configs.filter((c) => c.config_type === type);
  const matchingFiles = getFilesMatchingKeyword(documents, keyword);
  const nonMatchingFiles = getFilesNotMatchingKeyword(documents, keyword);
  const isCreatingNew = categoryId === 'NEW';

  return (
    <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
      <Label className="text-sm font-semibold text-slate-700">Quick Add Keyword</Label>

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1 min-w-[180px]">
          <Input
            className="bg-white"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Type a keyword..."
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={type}
            onValueChange={(val) => onTypeChange(val as KeywordConfig['config_type'])}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doc_type">Document Type</SelectItem>
              <SelectItem value="block_mapping">Block Mapping</SelectItem>
              <SelectItem value="board_exam">Board Exam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Select value={categoryId} onValueChange={onCategoryIdChange}>
            <SelectTrigger className="bg-white">
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
            className="bg-[#E5007D] hover:bg-[#c00069] text-white px-6 shrink-0"
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

      {/* Inline "new category" fields, only shown when "+ New Category" is selected */}
      {isCreatingNew && (
        <div className="flex flex-col md:flex-row gap-3 md:items-end pt-3 border-t border-slate-100">
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs font-semibold text-slate-500 mb-1 block">
              New category label
            </Label>
            <Input
              className="bg-white"
              value={newLabel}
              onChange={(e) => onNewLabelChange(e.target.value)}
              placeholder="e.g. Lab Manual"
            />
          </div>

          {type === 'block_mapping' && (
            <div className="w-full md:w-40">
              <Label className="text-xs font-semibold text-slate-500 mb-1 block">
                Curriculum Year
              </Label>
              <Select value={newYear} onValueChange={onNewYearChange}>
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

          <Button
            className="bg-[#E5007D] hover:bg-[#c00069] text-white px-6 shrink-0"
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

      {/* Live matching preview for the keyword being typed */}
      {keyword.trim() && (
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">
                Matching "{keyword.trim()}" ({matchingFiles.length})
              </Label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                {matchingFiles.length > 0 ? (
                  <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '8rem' }}>
                    {matchingFiles.map((doc) => (
                      <li key={doc.id} className="p-2 px-3 hover:bg-white">
                        <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">{doc.folder_path}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-3 text-sm text-slate-400 italic">No matching files found.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 md:border-l md:border-slate-100 md:pl-4">
              <Label className="text-xs font-semibold text-slate-400">
                Other Files ({nonMatchingFiles.length})
              </Label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                {nonMatchingFiles.length > 0 ? (
                  <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '8rem' }}>
                    {nonMatchingFiles.map((doc) => (
                      <li key={doc.id} className="p-2 px-3 hover:bg-white opacity-60">
                        <p className="text-sm font-medium text-slate-700">{doc.title}</p>
                        <p className="text-xs text-slate-400 font-mono truncate">{doc.folder_path}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-3 text-sm text-slate-400 italic">No other files.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}