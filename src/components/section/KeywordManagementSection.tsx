import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loader2, Plus, Settings } from 'lucide-react';
import {
  getKeywordConfigs,
  editKeywordConfig,
  addKeywordConfig,
  removeKeywordConfig,
  getStudentDocuments,
  updateStudentDocument,
} from '../../lib/dataService';
import type { KeywordConfig, StudentDocument } from '../../lib/types';
import { initializeCategorizer } from '../categorize';
import { getMatchingFiles } from '../../lib/KeywordMatching';
import { QuickAddKeywordBar } from '../keyword/Quickaddkeywordbar';
import { KeywordCategoryCard } from '../keyword/KeywordCategoryCard';

interface FocusedKey {
  configId: string;
  keyIndex: number;
}

export function KeywordManagementSection() {
  const [configs, setConfigs] = useState<KeywordConfig[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'doc_type' | 'block_mapping'>('doc_type');
  const [focusedKey, setFocusedKey] = useState<FocusedKey | null>(null);

  // Quick-add bar state
  const [quickAddKeyword, setQuickAddKeyword] = useState('');
  const [quickAddType, setQuickAddType] = useState<'doc_type' | 'block_mapping'>('doc_type');
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string>(''); // '' = unselected, 'NEW' = new category
  const [quickAddNewLabel, setQuickAddNewLabel] = useState('');
  const [quickAddNewYear, setQuickAddNewYear] = useState('1');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configsData, docsData] = await Promise.all([getKeywordConfigs(), getStudentDocuments()]);
      setConfigs(configsData);
      setDocuments(docsData);
      initializeCategorizer(configsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Category card handlers ─────────────────────────────────────────────
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
    const newKeys = config.keys.filter((_, i) => i !== keyIndex);
    handleUpdateConfig(id, { keys: newKeys });
  };

  const handleSave = async (config: KeywordConfig) => {
    setIsSaving(true);
    try {
      const matchingDocs = getMatchingFiles(documents, config);
      const matchingDocIds = new Set(matchingDocs.map((d) => d.id));

      const staleDocs = documents
        .filter((doc) => !matchingDocIds.has(doc.id))
        .filter((doc) => {
          if (config.config_type === 'doc_type') return doc.doc_type === config.label;
          if (config.config_type === 'block_mapping') return doc.block === config.label;
          return false;
        });

      if (config.id.startsWith('new-')) {
        const { id, ...rest } = config;
        await addKeywordConfig(rest);
      } else {
        await editKeywordConfig(config.id, config);
      }

      const staleDocUpdates = staleDocs.map((doc) => {
        const resets: Partial<StudentDocument> = {};
        if (config.config_type === 'doc_type') resets.doc_type = '';
        if (config.config_type === 'block_mapping') {
          resets.block = '';
          resets.student_year = undefined;
        }
        return updateStudentDocument(doc.id, resets);
      });

      const newDocUpdates = Array.from(matchingDocIds).map((id) => {
        const updates: Partial<StudentDocument> = {};
        if (config.config_type === 'doc_type') {
          updates.doc_type = config.label;
        } else if (config.config_type === 'block_mapping') {
          updates.block = config.label;
          if (config.year && config.year !== 'other') {
            updates.student_year = Number(config.year);
          }
        }
        return updateStudentDocument(id, updates);
      });

      await Promise.all([...staleDocUpdates, ...newDocUpdates]);
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

    if (!confirm('Are you sure you want to delete this category? This will affect how files are categorized.')) return;

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

  // ── Quick-add bar handler ──────────────────────────────────────────────
  const handleQuickAddKeyword = async () => {
    const keyword = quickAddKeyword.trim();
    if (!keyword || !quickAddCategoryId) return;

    setIsQuickAdding(true);
    try {
      if (quickAddCategoryId === 'NEW') {
        const label = quickAddNewLabel.trim();
        if (!label) {
          setIsQuickAdding(false);
          return;
        }
        const newConfig: Omit<KeywordConfig, 'id'> = {
          config_type: quickAddType,
          label,
          keys: [keyword],
          year: quickAddType === 'block_mapping' ? quickAddNewYear : undefined,
        };
        await addKeywordConfig(newConfig);
      } else {
        const existing = configs.find((c) => c.id === quickAddCategoryId);
        if (!existing) {
          setIsQuickAdding(false);
          return;
        }
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

  const handleQuickAddTypeChange = (val: 'doc_type' | 'block_mapping') => {
    setQuickAddType(val);
    setQuickAddCategoryId(''); // category list depends on type, so reset
  };

  const filteredConfigs = configs.filter((c) => c.config_type === activeTab);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-[#E5007D]" />
            Keyword Management
          </h1>
          <p className="text-slate-500 mt-1">
            Configure how files are automatically categorized based on keywords.
          </p>
        </div>
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
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('doc_type')}
            className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'doc_type'
                ? 'border-[#E5007D] text-[#E5007D] bg-pink-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Document Types
          </button>
          <button
            onClick={() => setActiveTab('block_mapping')}
            className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'block_mapping'
                ? 'border-[#E5007D] text-[#E5007D] bg-pink-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Block Mappings
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#E5007D]" />
            </div>
          ) : (
            <div className="grid gap-6">
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
                    Add New {activeTab === 'doc_type' ? 'Document Type' : 'Block Mapping'}
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