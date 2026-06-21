import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Trash2, Save, X, Settings } from 'lucide-react';
import { getKeywordConfigs, editKeywordConfig, addKeywordConfig, removeKeywordConfig, getStudentDocuments, updateStudentDocument } from '../../lib/dataService';
import type { KeywordConfig, StudentDocument } from '../../lib/types';
import { initializeCategorizer } from '../categorize';

export function KeywordManagementSection() {
  const [configs, setConfigs] = useState<KeywordConfig[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'doc_type' | 'block_mapping'>('doc_type');
  const [focusedKey, setFocusedKey] = useState<{ configId: string; keyIndex: number } | null>(null);
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

  const handleUpdateConfig = (id: string, updates: Partial<KeywordConfig>) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleAddKey = (id: string) => {
    const config = configs.find(c => c.id === id);
    if (!config) return;
    handleUpdateConfig(id, { keys: [...config.keys, ''] });
  };

  const handleUpdateKey = (id: string, keyIndex: number, value: string) => {
    const config = configs.find(c => c.id === id);
    if (!config) return;
    const newKeys = [...config.keys];
    newKeys[keyIndex] = value;
    handleUpdateConfig(id, { keys: newKeys });
  };

  const handleRemoveKey = (id: string, keyIndex: number) => {
    const config = configs.find(c => c.id === id);
    if (!config) return;
    const newKeys = config.keys.filter((_, i) => i !== keyIndex);
    handleUpdateConfig(id, { keys: newKeys });
  };

  const handleSave = async (config: KeywordConfig) => {
    setIsSaving(true);
    try {
      const matchingDocs = getMatchingFiles(config);
      const matchingDocIds = new Set(matchingDocs.map(d => d.id));

      const staleDocs = documents
        .filter(doc => !matchingDocIds.has(doc.id))
        .filter(doc => {
          if (config.config_type === 'doc_type') return doc.doc_type === config.label;
          if (config.config_type === 'block_mapping') return doc.block === config.label;
          return false;
        });

      // Save the keyword config
      if (config.id.startsWith('new-')) {
        const { id, ...rest } = config;
        await addKeywordConfig(rest);
      } else {
        await editKeywordConfig(config.id, config);
      }

      // Clear stale docs
      const staleDocUpdates = staleDocs.map(doc => {
        const resets: Partial<StudentDocument> = {};
        if (config.config_type === 'doc_type') resets.doc_type = '';
        if (config.config_type === 'block_mapping') {
          resets.block = '';
          resets.student_year = undefined;
        }
        return updateStudentDocument(doc.id, resets);
      });

      // Update matching docs
      const newDocUpdates = Array.from(matchingDocIds).map(id => {
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
      setConfigs(prev => prev.filter(c => c.id !== id));
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
      year: activeTab === 'block_mapping' ? '1' : undefined
    };
    setConfigs(prev => [...prev, newConfig]);
  };

  const getMatchingFiles = (config: KeywordConfig, onlyKeyIndex?: number) => {
    const keysToCheck =
      onlyKeyIndex !== undefined
        ? [config.keys[onlyKeyIndex] ?? '']
        : config.keys;

    return documents.filter(doc =>
      keysToCheck.some(key =>
        key.trim() !== '' &&
        (doc.title.toLowerCase().includes(key.toLowerCase()) ||
          doc.folder_path.toLowerCase().includes(key.toLowerCase()))
      )
    );
  };
  const handleQuickAddKeyword = async () => {
    const keyword = quickAddKeyword.trim();
    if (!keyword) return;
    if (!quickAddCategoryId) return; // must pick a category or "+ New"

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
        const existing = configs.find(c => c.id === quickAddCategoryId);
        if (!existing) {
          setIsQuickAdding(false);
          return;
        }
        // avoid duplicate keys (case-insensitive)
        const alreadyHasKey = existing.keys.some(
          k => k.trim().toLowerCase() === keyword.toLowerCase()
        );
        const updatedKeys = alreadyHasKey ? existing.keys : [...existing.keys, keyword];
        await editKeywordConfig(existing.id, { ...existing, keys: updatedKeys });
      }

      // Reset the quick-add bar
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
  const quickAddCategoryOptions = configs.filter(c => c.config_type === quickAddType);
  const quickAddMatchingFiles = quickAddKeyword.trim()
    ? documents.filter(doc =>
      doc.title.toLowerCase().includes(quickAddKeyword.trim().toLowerCase()) ||
      doc.folder_path.toLowerCase().includes(quickAddKeyword.trim().toLowerCase())
    )
    : [];
  const quickAddNonMatchingFiles = quickAddKeyword.trim()
    ? documents.filter(doc =>
      !(doc.title.toLowerCase().includes(quickAddKeyword.trim().toLowerCase()) ||
        doc.folder_path.toLowerCase().includes(quickAddKeyword.trim().toLowerCase()))
    )
    : [];
  const getMatchingFilesExcludingKey = (config: KeywordConfig, excludeKeyIndex: number) => {
    const keysToCheck = config.keys.filter((_, i) => i !== excludeKeyIndex);

    return documents.filter(doc =>
      keysToCheck.some(key =>
        key.trim() !== '' &&
        (doc.title.toLowerCase().includes(key.toLowerCase()) ||
          doc.folder_path.toLowerCase().includes(key.toLowerCase()))
      )
    );
  };
  const filteredConfigs = configs.filter(c => c.config_type === activeTab);

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

      {/* Quick Add Keyword Bar */}
      <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
        <Label className="text-sm font-semibold text-slate-700">Quick Add Keyword</Label>
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1 min-w-[180px]">
            <Input
              className="bg-white"
              value={quickAddKeyword}
              onChange={(e) => setQuickAddKeyword(e.target.value)}
              placeholder="Type a keyword..."
            />
          </div>
          {quickAddKeyword.trim() && (
            <div className="pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT: matches */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">
                    Matching "{quickAddKeyword.trim()}" ({quickAddMatchingFiles.length})
                  </Label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    {quickAddMatchingFiles.length > 0 ? (
                      <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '8rem' }}>
                        {quickAddMatchingFiles.map((doc) => (
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

                {/* RIGHT: the rest */}
                <div className="space-y-2 md:border-l md:border-slate-100 md:pl-4">
                  <Label className="text-xs font-semibold text-slate-400">
                    Other Files ({quickAddNonMatchingFiles.length})
                  </Label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    {quickAddNonMatchingFiles.length > 0 ? (
                      <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '8rem' }}>
                        {quickAddNonMatchingFiles.map((doc) => (
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

          <div className="w-full md:w-48">
            <Select
              value={quickAddType}
              onValueChange={(val) => handleQuickAddTypeChange(val as 'doc_type' | 'block_mapping')}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doc_type">Document Type</SelectItem>
                <SelectItem value="block_mapping">Block Mapping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-56">
            <Select
              value={quickAddCategoryId}
              onValueChange={(val) => setQuickAddCategoryId(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">+ New Category</SelectItem>
                {quickAddCategoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {quickAddCategoryId !== 'NEW' && (
            <Button
              className="bg-[#E5007D] hover:bg-[#c00069] text-white px-6 shrink-0"
              onClick={handleQuickAddKeyword}
              disabled={isQuickAdding || !quickAddKeyword.trim() || !quickAddCategoryId}
            >
              {isQuickAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add
            </Button>
          )}
        </div>

        {/* Inline "new category" fields, only shown when "+ New Category" is selected */}
        {quickAddCategoryId === 'NEW' && (
          <div className="flex flex-col md:flex-row gap-3 md:items-end pt-3 border-t border-slate-100">
            <div className="flex-1 min-w-[180px]">
              <Label className="text-xs font-semibold text-slate-500 mb-1 block">New category label</Label>
              <Input
                className="bg-white"
                value={quickAddNewLabel}
                onChange={(e) => setQuickAddNewLabel(e.target.value)}
                placeholder="e.g. Lab Manual"
              />
            </div>

            {quickAddType === 'block_mapping' && (
              <div className="w-full md:w-40">
                <Label className="text-xs font-semibold text-slate-500 mb-1 block">Curriculum Year</Label>
                <Select value={quickAddNewYear} onValueChange={setQuickAddNewYear}>
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
              onClick={handleQuickAddKeyword}
              disabled={isQuickAdding || !quickAddKeyword.trim() || !quickAddNewLabel.trim()}
            >
              {isQuickAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create & Add
            </Button>
          </div>
        )}
      </div>

      <div className=" shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('doc_type')}
            className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'doc_type'
              ? 'border-[#E5007D] text-[#E5007D] bg-pink-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            Document Types
          </button>
          <button
            onClick={() => setActiveTab('block_mapping')}
            className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'block_mapping'
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
              {filteredConfigs.map((config) => {
                const isFocusedHere = focusedKey?.configId === config.id;
                const matchingFiles = getMatchingFiles(
                  config,
                  isFocusedHere ? focusedKey.keyIndex : undefined
                );
                const beforeKeyFiles = isFocusedHere
                  ? getMatchingFilesExcludingKey(config, focusedKey.keyIndex)
                  : [];
                return (
                  <div key={config.id} className="p-6 border border-slate-200 rounded-2xl space-y-6 bg-white hover:border-pink-200 transition-colors">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-slate-700">Display Label</Label>
                          <Input
                            className="bg-white"
                            value={config.label}
                            onChange={(e) => handleUpdateConfig(config.id, { label: e.target.value })}
                          />
                        </div>
                        {activeTab === 'block_mapping' && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Curriculum Year</Label>
                            <Select
                              value={config.year}
                              onValueChange={(val) => handleUpdateConfig(config.id, { year: val })}
                            >
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
                          onClick={() => handleDeleteConfig(config.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          className="bg-[#E5007D] hover:bg-[#c00069] text-white px-6"
                          onClick={() => handleSave(config)}
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
                          <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg pl-3 pr-1 py-1 group focus-within:border-[#E5007D] transition-colors">
                            <input
                              className="bg-transparent text-sm focus:outline-none min-w-[120px] text-slate-600"
                              value={key}
                              onChange={(e) => handleUpdateKey(config.id, idx, e.target.value)}
                              onFocus={() => setFocusedKey({ configId: config.id, keyIndex: idx })}
                              onBlur={() => setFocusedKey(null)}
                              placeholder="Type keyword..."
                            />
                            <button
                              onClick={() => handleRemoveKey(config.id, idx)}
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
                          onClick={() => handleAddKey(config.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Key
                        </Button>
                      </div>
                    </div>

                    {/* Matching Files List */}
                    {/* Matching Files List */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      {isFocusedHere ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* LEFT: matches including this key */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                              With "{config.keys[focusedKey.keyIndex] || '...'}" ({matchingFiles.length})
                            </Label>
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                              {matchingFiles.length > 0 ? (
                                <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '10rem' }}>
                                  {matchingFiles.map((doc) => (
                                    <li key={doc.id} className="p-3 flex items-start gap-3 hover:bg-slate-50">
                                      <div>
                                        <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                                        <p className="text-xs text-slate-500 font-mono truncate">{doc.folder_path}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="p-4 text-sm text-slate-400 italic">No matching files found.</p>
                              )}
                            </div>
                          </div>

                          {/* RIGHT: matches before this key existed (rest of the category's keys) */}
                          <div className="space-y-2 md:border-l md:border-slate-100 md:pl-4">
                            <Label className="text-sm font-semibold text-slate-400">
                              Before This Key ({beforeKeyFiles.length})
                            </Label>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                              {beforeKeyFiles.length > 0 ? (
                                <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '10rem' }}>
                                  {beforeKeyFiles.map((doc) => (
                                    <li key={doc.id} className="p-3 flex items-start gap-3 hover:bg-white opacity-60">
                                      <div>
                                        <p className="text-sm font-medium text-slate-700">{doc.title}</p>
                                        <p className="text-xs text-slate-400 font-mono truncate">{doc.folder_path}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="p-4 text-sm text-slate-400 italic">No files matched without this key.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Label className="text-sm font-semibold text-slate-700">
                            Matching Files ({matchingFiles.length})
                          </Label>
                          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            {matchingFiles.length > 0 ? (
                              <ul className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '10rem' }}>
                                {matchingFiles.map((doc) => (
                                  <li key={doc.id} className="p-3 flex items-start gap-3 hover:bg-slate-50">
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                                      <p className="text-xs text-slate-500 font-mono truncate">{doc.folder_path}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="p-4 text-sm text-slate-400 italic">No matching files found.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}

              <Button
                variant="outline"
                className="w-full py-10 border-dashed border-2 hover:bg-pink-50 hover:border-pink-300 hover:text-[#E5007D] rounded-2xl group transition-all"
                onClick={handleAddNewCategory}
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8 text-slate-300 group-hover:text-[#E5007D] transition-colors" />
                  <span className="text-lg font-medium">Add New {activeTab === 'doc_type' ? 'Document Type' : 'Block Mapping'}</span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}