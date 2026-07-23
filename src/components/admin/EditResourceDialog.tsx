import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Upload, X } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { ResourceFormData } from './AddResourceDialog';
import { extractDriveId, checkDriveIdExists, fetchKeywordConfigs, fetchResourceByDriveId } from '../../lib/supabase';
import type { KeywordConfig } from '../../lib/types';

interface EditResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResourceFormData & { id: string }) => Promise<void>;
  initialData?: ResourceFormData & { id: string };
}

export function EditResourceDialog({ open, onOpenChange, onSubmit, initialData }: EditResourceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [keywordConfigs, setKeywordConfigs] = useState<KeywordConfig[]>([]);
  const [formData, setFormData] = useState<ResourceFormData & { id: string }>({
    id: '',
    fileName: '',
    // blockCode: '',?
    generation: 'MDCU 81',
    block: 'Block 1',
    category: 'AC',
    driveLink: '',
    thumbnail: '',
    isOverridden: false,
  });

  useEffect(() => {
    let isMounted = true;

    const loadKeywordConfigs = async () => {
      try {
        const configs = await fetchKeywordConfigs();
        if (isMounted) {
          setKeywordConfigs(configs);
        }
      } catch (error) {
        console.error('Error loading keyword configs:', error);
      }
    };

    loadKeywordConfigs();
    return () => {
      isMounted = false;
    };
  }, [open]); // refetch each time dialog opens, per earlier fix

  useEffect(() => {
    if (open && initialData) {
      setFormData(initialData);
      setThumbnailPreview(initialData.thumbnail || '');
    }
  }, [open, initialData]);

  // Live override check: re-verify drive ID conflict whenever a non-drive field changes
  // useEffect(() => {
  //   if (!initialData || formData.isOverridden) return; // already true, nothing to check

  //   const nonDriveFieldsChanged =
  //     formData.fileName !== initialData.fileName ||
  //     formData.generation !== initialData.generation ||
  //     formData.block !== initialData.block ||
  //     formData.category !== initialData.category ||
  //     (formData.boardExam || '') !== (initialData.boardExam || '');

  //   if (!nonDriveFieldsChanged) return;

  //   const driveId = extractDriveId(formData.driveLink);
  //   if (!driveId) return;

  //   let isMounted = true;
  //   const timeoutId = setTimeout(async () => {
  //     try {
  //       const exists = await checkDriveIdExists(driveId, formData.id);
  //       if (isMounted) {
  //         setFormData((prev) => ({ ...prev, isOverridden: exists ? true : prev.isOverridden || false }));
  //         if (exists) {
  //           const match = await fetchResourceByDriveId(driveId, formData.id);
  //           if (match && !formData.fileName) {
  //             setFormData((prev) => ({ ...prev, fileName: match.title }));
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error checking existing drive id:', error);
  //     }
  //   }, 400);

  //   return () => {
  //     isMounted = false;
  //     clearTimeout(timeoutId);
  //   };
  // }, [formData.fileName, formData.generation, formData.block, formData.category, formData.boardExam, formData.driveLink, formData.id, formData.isOverridden, initialData]);

  useEffect(() => {
    if (!initialData || formData.isOverridden) return;

    const nonDriveFieldsChanged =
      formData.fileName !== initialData.fileName ||
      formData.generation !== initialData.generation ||
      formData.block !== initialData.block ||
      formData.category !== initialData.category ||
      (formData.boardExam || '') !== (initialData.boardExam || '');

    if (nonDriveFieldsChanged) {
      setFormData((prev) => ({ ...prev, isOverridden: true }));
    }
  }, [
    formData.fileName,
    formData.generation,
    formData.block,
    formData.category,
    formData.boardExam,
    formData.isOverridden,
    initialData,
  ]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   try {
  //     let updatedIsOverridden = formData.isOverridden;

  //     const nonDriveFieldsChanged =
  //       initialData &&
  //       (formData.fileName !== initialData.fileName ||
  //         formData.generation !== initialData.generation ||
  //         formData.block !== initialData.block ||
  //         formData.category !== initialData.category ||
  //         (formData.boardExam || '') !== (initialData.boardExam || ''));

  //     if (nonDriveFieldsChanged && !formData.isOverridden) {
  //       const driveId = extractDriveId(formData.driveLink);
  //       if (driveId) {
  //         const exists = await checkDriveIdExists(driveId, formData.id);
  //         if (exists) {
  //           updatedIsOverridden = true;
  //         }
  //       }
  //     }

  //     await onSubmit({ ...formData, thumbnail: thumbnailPreview, isOverridden: updatedIsOverridden });
  //     onOpenChange(false);
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const nonDriveFieldsChanged =
        initialData &&
        (formData.fileName !== initialData.fileName ||
          formData.generation !== initialData.generation ||
          formData.block !== initialData.block ||
          formData.category !== initialData.category ||
          (formData.boardExam || '') !== (initialData.boardExam || ''));

      const finalIsOverridden = formData.isOverridden || Boolean(nonDriveFieldsChanged);

      await onSubmit({ ...formData, thumbnail: thumbnailPreview, isOverridden: finalIsOverridden });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const blockOptions = keywordConfigs.filter((config) => config.config_type === 'block_mapping').map((config) => config.label);
  const categoryOptions = keywordConfigs.filter((config) => config.config_type === 'doc_type').map((config) => config.label);
  const boardExamOptions = keywordConfigs.filter((config) => config.config_type === 'board_exam').map((config) => config.label);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>
            Update the details for this academic resource.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Block Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-fileName">File Name *</Label>
              <Input
                id="edit-fileName"
                placeholder="e.g., Cardiovascular System"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                required
              />
            </div>

            {/* Block Code */}
            {/* <div className="space-y-2">
              <Label htmlFor="edit-blockCode">Block Code</Label>
              <Input
                id="edit-blockCode"
                placeholder="e.g., CV-101"
                value={formData.blockCode}
                onChange={(e) => setFormData({ ...formData, blockCode: e.target.value })}
              />
            </div> */}

            {/* Generation and Block - Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="generation">Generation *</Label>
                <Select
                  value={formData.generation}
                  onValueChange={(value: any) => setFormData({ ...formData, generation: value })}
                >
                  <SelectTrigger id="generation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MDCU 82">MDCU 82</SelectItem>
                    <SelectItem value="MDCU 81">MDCU 81</SelectItem>
                    <SelectItem value="MDCU 80">MDCU 80</SelectItem>
                    <SelectItem value="MDCU 79">MDCU 79</SelectItem>
                    <SelectItem value="MDCU 78">MDCU 78</SelectItem>
                    <SelectItem value="MDCU 77">MDCU 77</SelectItem>
                    <SelectItem value="MDCU 76">MDCU 76</SelectItem>
                    <SelectItem value="MDCU 75">MDCU 75</SelectItem>
                    <SelectItem value="MDCU 74">MDCU 74</SelectItem>
                    <SelectItem value="MDCU 73">MDCU 73</SelectItem>
                    <SelectItem value="MDCU 72">MDCU 72</SelectItem>
                    <SelectItem value="MDCU 71">MDCU 71</SelectItem>
                    <SelectItem value="MDCU 70">MDCU 70</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-block">Block *</Label>
                <Select
                  value={formData.block}
                  onValueChange={(value: any) => setFormData({ ...formData, block: value })}
                >
                  <SelectTrigger id="edit-block">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.block && !blockOptions.includes(formData.block) && (
                      <SelectItem value={formData.block}>{formData.block}</SelectItem>
                    )}
                    {blockOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.category && !categoryOptions.includes(formData.category) && (
                    <SelectItem value={formData.category}>{formData.category}</SelectItem>
                  )}
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Board Exam */}
            <div className="space-y-2">
              <Label htmlFor="edit-boardExam">Board Exam</Label>
              <Select
                value={formData.boardExam || '__none__'}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, boardExam: value === '__none__' ? '' : value })
                }
              >
                <SelectTrigger id="edit-boardExam">
                  <SelectValue placeholder="Select board exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {formData.boardExam && !boardExamOptions.includes(formData.boardExam) && (
                    <SelectItem value={formData.boardExam}>{formData.boardExam}</SelectItem>
                  )}
                  {boardExamOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Override Toggle */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-start gap-3 opacity-70 cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isOverridden)}
                  disabled
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#E5007D]"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Manual override {formData.isOverridden ? 'enabled' : 'disabled'} for this resource</span>
                  <br />
                  This was set when the resource was created and can't be changed here.
                </span>
              </label>
            </div>

            {/* Google Drive Link */}
            <div className="space-y-2">
              <Label htmlFor="edit-driveLink">Google Drive Link *</Label>
              <Input
                id="edit-driveLink"
                type="url"
                value={formData.driveLink}
                disabled
                readOnly
                className="bg-slate-100 cursor-not-allowed text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Drive link can't be changed after creation. Delete and re-add the resource if it needs to point elsewhere.
              </p>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
              <div className="flex items-start gap-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <ImageWithFallback
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-slate-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => setThumbnailPreview('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="edit-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Upload a new thumbnail to replace the existing one (optional)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#E5007D] hover:bg-[#c00069]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
