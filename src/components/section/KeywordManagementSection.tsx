import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loader2, Plus, Settings, AlertTriangle } from 'lucide-react';
import {
  getKeywordConfigs,
  editKeywordConfig,
  addKeywordConfig,
  removeKeywordConfig,
  getStudentDocuments,
  updateStudentDocument,
} from '../../lib/dataService';
import type { KeywordConfig, StudentDocument, DriveSyncRecord } from '../../lib/types';
import { initializeCategorizer } from '../categorize';
import {
  classifyDocument,
  getMatchingFiles,
  findOverlaps,
  type OverlapInfo,
} from '../../lib/KeywordMatching';
import { QuickAddKeywordBar } from '../../components/keyword/Quickaddkeywordbar';
import { KeywordCategoryCard } from '../../components/keyword/KeywordCategoryCard';
import { getDriveSync } from '../../lib/dataService';

interface FocusedKey {
  configId: string;
  keyIndex: number;
}

// ─── Overlap audit panel ──────────────────────────────────────────────────────

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
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-100 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-sm font-semibold text-amber-800 flex-1">
          {overlaps.length} file{overlaps.length > 1 ? 's' : ''} match multiple{' '}
          {configType === 'doc_type' ? 'document type' : configType === 'block_mapping' ? 'block' : 'board exam'}{' '}
          categories — specificity rule decides the winner
        </span>
        <span className="text-xs text-amber-600">{expanded ? 'hide' : 'show'}</span>
      </button>

      {expanded && (
        <ul className="divide-y divide-amber-100 max-h-72 overflow-y-auto">
          {overlaps.map(({ doc, winner, losers, winnerScore, loserScores }) => (
            <li key={doc.id} className="px-4 py-3 text-xs">
              <p className="font-medium text-slate-800 truncate mb-1">{doc.title}</p>
              <p className="text-slate-500 font-mono truncate mb-2">{doc.folder_path}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                  ✓ {winner.label}
                  <span className="text-green-600 font-mono">score {winnerScore}</span>
                </span>
                {loserScores.map(({ config, score }) => (
                  <span
                    key={config.id}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 line-through"
                  >
                    {config.label}
                    <span className="font-mono no-underline">score {score}</span>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function KeywordManagementSection() {
  const [configs, setConfigs] = useState<KeywordConfig[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<KeywordConfig['config_type']>('doc_type');
  const [focusedKey, setFocusedKey] = useState<FocusedKey | null>(null);
  const [driveSyncRecords, setDriveSyncRecords] = useState<DriveSyncRecord[]>([]);

  // Quick-add bar state
  const [quickAddKeyword, setQuickAddKeyword] = useState('');
  const [quickAddType, setQuickAddType] = useState<KeywordConfig['config_type']>('doc_type');
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string>('');
  const [quickAddNewLabel, setQuickAddNewLabel] = useState('');
  const [quickAddNewYear, setQuickAddNewYear] = useState('1');
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

  // ── Category card handlers ────────────────────────────────────────────────

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

  /**
   * Save a config and re-classify every document that touches this config_type.
   *
   * Strategy (specificity-aware, single-label):
   *   1. Persist the config itself first.
   *   2. For every document that either currently carries this config's label
   *      OR matches any of its keywords, re-run classifyDocument() using the
   *      full updated configs array.  classifyDocument now picks the winner by
   *      specificity score, not DB insertion order.
   *   3. Write the winner label back; clear the field if nothing matches.
   */
  const handleSave = async (config: KeywordConfig) => {
    setIsSaving(true);
    try {
      // 1. Persist config
      if (config.id.startsWith('new-')) {
        const { id, ...rest } = config;
        await addKeywordConfig(rest);
      } else {
        await editKeywordConfig(config.id, config);
      }

      // 2. Build updated configs list for classification
      const updatedConfigs = configs.map((c) => (c.id === config.id ? config : c));

      // 3. Find all docs that are "in play" for this config_type:
      //    - docs that already carry any label from this config_type
      //    - docs that match any keyword in the saved config (newly affected)
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

      // 4. Re-classify each affected doc with specificity-aware classifier
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
      year: activeTab === 'block_mapping' ? '1' : undefined,
    };
    setConfigs((prev) => [...prev, newConfig]);
  };

  // ── Quick-add bar ─────────────────────────────────────────────────────────

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
      setQuickAddNewYear('1');
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

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredConfigs = configs.filter((c) => c.config_type === activeTab);

  // Compute overlaps for the active tab so admin can audit keyword conflicts
  const overlaps = findOverlaps(documents, configs, activeTab);

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
    <div className="space-y-8">
      <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-slate-900 text-[24px] font-bold flex items-center gap-2">
              <Settings className="w-8 h-8 text-[#E5007D]" />
              Keyword Management
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Configure how files are automatically categorized based on keywords
          </p>
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

      <div className="shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {(['doc_type', 'block_mapping', 'board_exam'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#E5007D] text-[#E5007D] bg-pink-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#E5007D]" />
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Overlap audit banner — only shown when conflicts exist */}
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

              <Button
                variant="outline"
                className="w-full py-10 border-dashed border-2 hover:bg-pink-50 hover:border-pink-300 hover:text-[#E5007D] rounded-2xl group transition-all"
                onClick={handleAddNewCategory}
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8 text-slate-300 group-hover:text-[#E5007D] transition-colors" />
                  <span className="text-lg font-medium">
                    Add New {NEW_LABEL[activeTab]}
                  </span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}