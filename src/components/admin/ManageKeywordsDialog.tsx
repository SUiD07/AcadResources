// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Loader2, Plus, Trash2, Save, X } from 'lucide-react';
// import { getKeywordConfigs, editKeywordConfig, addKeywordConfig, removeKeywordConfig } from '../../lib/dataService';
// import type { KeywordConfig } from '../../lib/types';
// import { initializeCategorizer } from '../categorize';

// interface ManageKeywordsDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function ManageKeywordsDialog({ open, onOpenChange }: ManageKeywordsDialogProps) {
//   const [configs, setConfigs] = useState<KeywordConfig[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<'doc_type' | 'block_mapping'>('doc_type');

//   useEffect(() => {
//     if (open) {
//       loadConfigs();
//     }
//   }, [open]);

//   const loadConfigs = async () => {
//     setIsLoading(true);
//     try {
//       const data = await getKeywordConfigs();
//       setConfigs(data);
//       // Re-initialize the categorizer with fresh data
//       initializeCategorizer(data);
//     } catch (error) {
//       console.error('Error loading keyword configs:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateConfig = (id: string, updates: Partial<KeywordConfig>) => {
//     setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
//   };

//   const handleAddKey = (id: string) => {
//     const config = configs.find(c => c.id === id);
//     if (!config) return;
//     handleUpdateConfig(id, { keys: [...config.keys, ''] });
//   };

//   const handleUpdateKey = (id: string, keyIndex: number, value: string) => {
//     const config = configs.find(c => c.id === id);
//     if (!config) return;
//     const newKeys = [...config.keys];
//     newKeys[keyIndex] = value;
//     handleUpdateConfig(id, { keys: newKeys });
//   };

//   const handleRemoveKey = (id: string, keyIndex: number) => {
//     const config = configs.find(c => c.id === id);
//     if (!config) return;
//     const newKeys = config.keys.filter((_, i) => i !== keyIndex);
//     handleUpdateConfig(id, { keys: newKeys });
//   };

//   const handleSave = async (config: KeywordConfig) => {
//     setIsSaving(true);
//     try {
//       if (config.id.startsWith('new-')) {
//         const { id, ...rest } = config;
//         await addKeywordConfig(rest);
//       } else {
//         await editKeywordConfig(config.id, config);
//       }
//       await loadConfigs(); // Reload to get fresh state and IDs
//     } catch (error) {
//       console.error('Error saving config:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteConfig = async (id: string) => {
//     if (id.startsWith('new-')) {
//       setConfigs(prev => prev.filter(c => c.id !== id));
//       return;
//     }

//     if (!confirm('Are you sure you want to delete this category? This will affect how files are categorized.')) return;

//     setIsSaving(true);
//     try {
//       await removeKeywordConfig(id);
//       await loadConfigs();
//     } catch (error) {
//       console.error('Error deleting config:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleAddNewCategory = () => {
//     const newConfig: KeywordConfig = {
//       id: `new-${Date.now()}`,
//       config_type: activeTab,
//       label: 'New Category',
//       keys: [''],
//       year: activeTab === 'block_mapping' ? '1' : undefined
//     };
//     setConfigs(prev => [...prev, newConfig]);
//   };

//   const filteredConfigs = configs.filter(c => c.config_type === activeTab);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[800px] max-h-[85vh] h-[85vh] flex flex-col p-0 overflow-hidden !grid-cols-1 !block">
//         <div className="flex flex-col h-full">
//           <DialogHeader className="p-6 pb-4 shrink-0">
//             <DialogTitle>Manage Categorization Keywords</DialogTitle>
//             <DialogDescription>
//               Edit the labels and keywords used to automatically categorize files.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="flex border-b border-slate-200 px-6 shrink-0">
//             <button
//               onClick={() => setActiveTab('doc_type')}
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'doc_type' 
//                   ? 'border-[#E5007D] text-[#E5007D]' 
//                   : 'border-transparent text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               Document Types
//             </button>
//             <button
//               onClick={() => setActiveTab('block_mapping')}
//               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
//                 activeTab === 'block_mapping' 
//                   ? 'border-[#E5007D] text-[#E5007D]' 
//                   : 'border-transparent text-slate-500 hover:text-slate-700'
//               }`}
//             >
//               Block Mappings
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
//             {isLoading ? (
//               <div className="flex items-center justify-center py-12">
//                 <Loader2 className="w-8 h-8 animate-spin text-[#E5007D]" />
//               </div>
//             ) : (
//               <>
//                 {filteredConfigs.map((config) => (
//                   <div key={config.id} className="p-4 border border-slate-200 rounded-xl space-y-4 bg-white shadow-sm">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex-1 grid grid-cols-2 gap-4">
//                         <div className="space-y-1">
//                           <Label className="text-xs">Label (Display Name)</Label>
//                           <Input 
//                             value={config.label} 
//                             onChange={(e) => handleUpdateConfig(config.id, { label: e.target.value })}
//                           />
//                         </div>
//                         {activeTab === 'block_mapping' && (
//                           <div className="space-y-1">
//                             <Label className="text-xs">Student Year</Label>
//                             <Select 
//                               value={config.year} 
//                               onValueChange={(val) => handleUpdateConfig(config.id, { year: val })}
//                             >
//                               <SelectTrigger>
//                                 <SelectValue />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="1">Year 1</SelectItem>
//                                 <SelectItem value="2">Year 2</SelectItem>
//                                 <SelectItem value="3">Year 3</SelectItem>
//                                 <SelectItem value="4">Year 4</SelectItem>
//                                 <SelectItem value="5">Year 5</SelectItem>
//                                 <SelectItem value="6">Year 6</SelectItem>
//                                 <SelectItem value="other">Other</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex gap-2">
//                         <Button 
//                           size="sm" 
//                           variant="ghost" 
//                           className="text-slate-400 hover:text-red-600"
//                           onClick={() => handleDeleteConfig(config.id)}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
//                         <Button 
//                           size="sm" 
//                           className="bg-emerald-500 hover:bg-emerald-600 text-white"
//                           onClick={() => handleSave(config)}
//                           disabled={isSaving}
//                         >
//                           <Save className="w-4 h-4 mr-2" />
//                           Save
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-xs text-slate-500">Keywords (Case-insensitive matching)</Label>
//                       <div className="flex flex-wrap gap-2">
//                         {config.keys.map((key, idx) => (
//                           <div key={idx} className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">
//                             <input 
//                               className="bg-transparent text-sm focus:outline-none min-w-[80px]"
//                               value={key}
//                               onChange={(e) => handleUpdateKey(config.id, idx, e.target.value)}
//                             />
//                             <button 
//                               onClick={() => handleRemoveKey(config.id, idx)}
//                               className="text-slate-400 hover:text-red-500"
//                             >
//                               <X className="w-3 h-3" />
//                             </button>
//                           </div>
//                         ))}
//                         <Button 
//                           variant="outline" 
//                           size="sm" 
//                           className="h-8 border-dashed"
//                           onClick={() => handleAddKey(config.id)}
//                         >
//                           <Plus className="w-3 h-3 mr-1" /> Add Key
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 <Button 
//                   variant="outline" 
//                   className="w-full py-6 border-dashed border-2 hover:bg-pink-50 hover:border-pink-200 hover:text-[#E5007D]"
//                   onClick={handleAddNewCategory}
//                 >
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add New {activeTab === 'doc_type' ? 'Document Type' : 'Block Mapping'}
//                 </Button>
//               </>
//             )}
//           </div>

//           <DialogFooter className="p-6 border-t border-slate-200 shrink-0">
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Close
//             </Button>
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }