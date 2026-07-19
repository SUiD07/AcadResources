import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Plus, Settings, AlertTriangle, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import {
  getKeywordConfigs,
  editKeywordConfig,
  addKeywordConfig,
  removeKeywordConfig,
  getStudentDocuments,
  updateStudentDocument,
  getPromoteYearUserCount,
  adminPromoteYear,
} from '../../lib/dataService';
import type { KeywordConfig, StudentDocument, DriveSyncRecord } from '../../lib/types';
import { initializeCategorizer } from '../categorize';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { toast } from 'sonner';
import {
  classifyDocument,
  getMatchingFiles,
  findOverlaps,
  type OverlapInfo,
} from '../../lib/KeywordMatching';
import { QuickAddKeywordBar } from '../../components/keyword/Quickaddkeywordbar';
import { KeywordCategoryCard } from '../../components/keyword/KeywordCategoryCard';
import { getDriveSync } from '../../lib/dataService';
import { Virtuoso } from "react-virtuoso"

interface FocusedKey {
  configId: string;
  keyIndex: number;
}

function PromoteYearDialog() {
  const [open, setOpen] = useState(false);
  const [sourceYear, setSourceYear] = useState('1');
  const [targetYear, setTargetYear] = useState('2');
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open) {
      setCount(null);
      setConfirming(false);
    }
  }, [open]);

  const handleCheckCount = async () => {
    setLoading(true);
    try {
      const c = await getPromoteYearUserCount(sourceYear);
      setCount(c);
      setConfirming(true);
    } catch (e) {
      toast.error('Failed to get user count');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    setLoading(true);
    try {
      const result = await adminPromoteYear(sourceYear, targetYear, 'admin@example.com');
      if (result.success) {
        toast.success(`Successfully promoted ${result.count} users from Year ${sourceYear} to Year ${targetYear}`);
        setOpen(false);
      } else {
        toast.error(`Error promoting users: ${result.error}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-pink-200 text-[#E5007D] hover:bg-pink-50 text-sm h-9 px-4 hidden sm:flex">
          Promote Year
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Students Year</DialogTitle>
          <DialogDescription>
            Bulk update user preferences from a source year to a target year.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Source Year</label>
            <input 
              className="col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5007D] disabled:opacity-50" 
              value={sourceYear} 
              onChange={e => setSourceYear(e.target.value)} 
              disabled={confirming || loading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">Target Year</label>
            <input 
              className="col-span-3 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5007D] disabled:opacity-50" 
              value={targetYear} 
              onChange={e => setTargetYear(e.target.value)} 
              disabled={confirming || loading}
            />
          </div>

          {confirming && count !== null && (
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mt-2">
              <p className="text-sm text-amber-800 font-medium text-center">
                Are you sure? This will update {count} user{count !== 1 ? 's' : ''}.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!confirming ? (
            <Button onClick={handleCheckCount} disabled={loading || !sourceYear || !targetYear} className="bg-[#E5007D] hover:bg-pink-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Count Users
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setConfirming(false)} disabled={loading}>Cancel</Button>
              <Button onClick={handlePromote} disabled={loading} className="bg-[#E5007D] hover:bg-pink-700 text-white">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Promote
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OverlapAuditPanel({
  overlaps,
  configType,
}: {
  overlaps: OverlapInfo[];
  configType: KeywordConfig['config_type'];
}) {
  const [expanded, setExpanded] = useState(false);

  if (overlaps.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold text-amber-900 flex-1">
          {overlaps.length} file{overlaps.length > 1 ? 's' : ''} match multiple{' '}
          {configType === 'doc_type' ? 'document type' : configType === 'block_mapping' ? 'block' : 'board exam'}{' '}
          categories — specificity rule decides the winner
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600 shrink-0" />
        )}
      </button>

      {expanded && (
        <Virtuoso
          style={{ height: 288, width: "100%" }} // 288px ≈ your old max-h-72 (72 * 4px)
          data={overlaps}
          itemContent={(index, { doc, winner, winnerScore, loserScores }) => (
            <li key={doc.id} className="px-4 sm:px-5 py-3 text-xs min-w-0 bg-white/60 border-t border-amber-200">
              <p className="font-medium text-slate-900 truncate mb-1">{doc.title}</p>
              <p className="font-mono text-slate-500 truncate mb-2">{doc.folder_path}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-[#E5007D] font-medium">
                  <Check className="w-3 h-3" /> {winner.label}
                  <span className="font-mono opacity-70">score {winnerScore}</span>
                </span>
                {loserScores.map(({ config, score }) => (
                  <span key={config.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 line-through">
                    {config.label}
                    <span className="font-mono no-underline">score {score}</span>
                  </span>
                ))}
              </div>
            </li>
          )}
        />
      )}
    </Card>
  );
}

export function KeywordManagementSection({ defaultYear = '1' }: { defaultYear?: string }) {
  const [configs, setConfigs] = useState<KeywordConfig[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<KeywordConfig['config_type']>('doc_type');
  const [focusedKey, setFocusedKey] = useState<FocusedKey | null>(null);
  const [driveSyncRecords, setDriveSyncRecords] = useState<DriveSyncRecord[]>([]);

  const [quickAddKeyword, setQuickAddKeyword] = useState('');
  const [quickAddType, setQuickAddType] = useState<KeywordConfig['config_type']>('doc_type');
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string>('');
  const [quickAddNewLabel, setQuickAddNewLabel] = useState('');
  const [quickAddNewYear, setQuickAddNewYear] = useState(defaultYear);
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configsData, docsData, driveSyncData] = await Promise.all([
        getKeywordConfigs(),
        getStudentDocuments(),
        getDriveSync(),
      ]);
      setConfigs(configsData);
      setDriveSyncRecords(driveSyncData);
      setDocuments(docsData);
      initializeCategorizer(configsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = (id: string, updates: Partial<KeywordConfig>) => {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleAddKey = (id: string) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    handleUpdateConfig(id, { keys: [...config.keys, ''] });
  };

  const handleUpdateKey = (id: string, keyIndex: number, value: string) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    const newKeys = [...config.keys];
    newKeys[keyIndex] = value;
    handleUpdateConfig(id, { keys: newKeys });
  };

  const handleRemoveKey = (id: string, keyIndex: number) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    handleUpdateConfig(id, { keys: config.keys.filter((_, i) => i !== keyIndex) });
  };

  const handleSave = async (config: KeywordConfig) => {
    setIsSaving(true);
    try {
      if (config.id.startsWith('new-')) {
        const { id, ...rest } = config;
        await addKeywordConfig(rest);
      } else {
        await editKeywordConfig(config.id, config);
      }

      const updatedConfigs = configs.map((c) => (c.id === config.id ? config : c));

      const affectedByKeywords = getMatchingFiles(documents, config);
      const affectedByLabel = documents.filter((doc) => {
        if (config.config_type === 'doc_type') return !!doc.doc_type;
        if (config.config_type === 'block_mapping') return !!doc.block;
        if (config.config_type === 'board_exam') return !!doc.board_exam;
        return false;
      });

      const affectedIds = new Set([
        ...affectedByKeywords.map((d) => d.id),
        ...affectedByLabel.map((d) => d.id),
      ]);

      const updates = Array.from(affectedIds).map((docId) => {
        const doc = documents.find((d) => d.id === docId)!;
        const winner = classifyDocument(doc, updatedConfigs, config.config_type);

        const patch: Partial<StudentDocument> = {};
        if (config.config_type === 'doc_type') {
          patch.doc_type = winner?.label ?? '';
        } else if (config.config_type === 'block_mapping') {
          patch.block = winner?.label ?? '';
          patch.student_year =
            winner && winner.year && winner.year !== 'other'
              ? Number(winner.year)
              : undefined;
        } else if (config.config_type === 'board_exam') {
          patch.board_exam = winner?.label ?? '';
        }

        return updateStudentDocument(docId, patch);
      });

      await Promise.all(updates);
      await loadData();
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (id.startsWith('new-')) {
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    if (
      !confirm(
        'Are you sure you want to delete this category? This will affect how files are categorized.',
      )
    )
      return;

    setIsSaving(true);
    try {
      await removeKeywordConfig(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewCategory = () => {
    const newConfig: KeywordConfig = {
      id: `new-${Date.now()}`,
      config_type: activeTab,
      label: 'New Category',
      keys: [''],
      year: activeTab === 'block_mapping' ? defaultYear : undefined,
    };
    setConfigs((prev) => [...prev, newConfig]);
  };

  const handleQuickAddKeyword = async () => {
    const keyword = quickAddKeyword.trim();
    if (!keyword || !quickAddCategoryId) return;

    setIsQuickAdding(true);
    try {
      if (quickAddCategoryId === 'NEW') {
        const label = quickAddNewLabel.trim();
        if (!label) { setIsQuickAdding(false); return; }
        await addKeywordConfig({
          config_type: quickAddType,
          label,
          keys: [keyword],
          year: quickAddType === 'block_mapping' ? quickAddNewYear : undefined,
        });
      } else {
        const existing = configs.find((c) => c.id === quickAddCategoryId);
        if (!existing) { setIsQuickAdding(false); return; }
        const alreadyHasKey = existing.keys.some(
          (k) => k.trim().toLowerCase() === keyword.toLowerCase(),
        );
        const updatedKeys = alreadyHasKey ? existing.keys : [...existing.keys, keyword];
        await editKeywordConfig(existing.id, { ...existing, keys: updatedKeys });
      }

      setQuickAddKeyword('');
      setQuickAddCategoryId('');
      setQuickAddNewLabel('');
      setQuickAddNewYear(defaultYear);
      await loadData();
    } catch (error) {
      console.error('Error quick-adding keyword:', error);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleQuickAddTypeChange = (val: KeywordConfig['config_type']) => {
    setQuickAddType(val);
    setQuickAddCategoryId('');
  };

  const filteredConfigs = useMemo(() => configs.filter((c) => c.config_type === activeTab), [configs, activeTab]);
  const overlaps = useMemo(() => findOverlaps(documents, configs, activeTab), [documents, configs, activeTab]);

  const TAB_LABELS: Record<KeywordConfig['config_type'], string> = {
    doc_type: 'Document Types',
    block_mapping: 'Block Mappings',
    board_exam: 'Board Exam',
  };

  const NEW_LABEL: Record<KeywordConfig['config_type'], string> = {
    doc_type: 'Document Type',
    block_mapping: 'Block Mapping',
    board_exam: 'Board Exam',
  };

  return (
    <div className="pb-20 lg:pb-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-slate-900 text-[24px] font-bold flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-[#E5007D]" />
              </div>
              Keyword Management
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Configure how files are automatically categorized based on keywords
          </p>
        </div>
        <PromoteYearDialog />
      </div>

      <QuickAddKeywordBar
        documents={documents}
        configs={configs}
        keyword={quickAddKeyword}
        onKeywordChange={setQuickAddKeyword}
        type={quickAddType}
        onTypeChange={handleQuickAddTypeChange}
        categoryId={quickAddCategoryId}
        onCategoryIdChange={setQuickAddCategoryId}
        newLabel={quickAddNewLabel}
        onNewLabelChange={setQuickAddNewLabel}
        newYear={quickAddNewYear}
        onNewYearChange={setQuickAddNewYear}
        isSubmitting={isQuickAdding}
        onSubmit={handleQuickAddKeyword}
      />

      {/* Tabs */}
      <div className="flex flex-col">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 gap-1 sm:gap-2">
          {(['doc_type', 'block_mapping', 'board_exam'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${isActive
                  ? 'border-[#E5007D] text-[#E5007D]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>

        <div className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 sm:py-24">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#E5007D]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <OverlapAuditPanel overlaps={overlaps} configType={activeTab} />

              {filteredConfigs.map((config) => (
                <KeywordCategoryCard
                  key={config.id}
                  config={config}
                  documents={documents}
                  activeTab={activeTab}
                  isSaving={isSaving}
                  focusedKey={focusedKey}
                  onUpdateConfig={handleUpdateConfig}
                  onAddKey={handleAddKey}
                  onUpdateKey={handleUpdateKey}
                  onRemoveKey={handleRemoveKey}
                  onFocusKey={(configId, keyIndex) => setFocusedKey({ configId, keyIndex })}
                  onBlurKey={() => setFocusedKey(null)}
                  onSave={handleSave}
                  onDelete={handleDeleteConfig}
                  driveSyncRecords={driveSyncRecords}
                />
              ))}

              <button
                onClick={handleAddNewCategory}
                className="w-full py-8 sm:py-10 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#E5007D] hover:bg-pink-50/50 transition-colors group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5007D]" />
                  </div>
                  <span className="text-sm sm:text-lg font-medium text-slate-700">
                    Add New {NEW_LABEL[activeTab]}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}