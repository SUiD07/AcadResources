import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Upload, X } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { extractDriveId, fetchKeywordConfigs, fetchStudentDocuments } from '../../lib/supabase';
import type { KeywordConfig } from '../../lib/types';

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  categoryName?: string;
}

export interface ResourceFormData {
  blockName: string;
  blockCode: string;
  generation: string;
  block: string;
  category: string;
  boardExam?: string;
  driveLink: string;
  thumbnail: string;
  isOverridden?: boolean;
}

export function AddResourceDialog({ open, onOpenChange, onSubmit, categoryName }: AddResourceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [keywordConfigs, setKeywordConfigs] = useState<KeywordConfig[]>([]);
  const [formData, setFormData] = useState<ResourceFormData>({
    blockName: '',
    blockCode: '',
    generation: 'MDCU 81',
    block: 'Block 1',
    category: categoryName || 'AC',
    boardExam: '',
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
          setFormData((prev) => ({
            ...prev,
            block: configs.some((c) => c.config_type === 'block_mapping' && c.label === prev.block)
              ? prev.block
              : configs.find((c) => c.config_type === 'block_mapping')?.label || prev.block,
            category: configs.some((c) => c.config_type === 'doc_type' && c.label === prev.category)
              ? prev.category
              : configs.find((c) => c.config_type === 'doc_type')?.label || prev.category,
            boardExam: configs.some((c) => c.config_type === 'board_exam' && c.label === prev.boardExam)
              ? prev.boardExam || ''
              : configs.find((c) => c.config_type === 'board_exam')?.label || prev.boardExam || '',
          }));
        }
      } catch (error) {
        console.error('Error loading keyword configs:', error);
      }
    };

    loadKeywordConfigs();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const driveId = extractDriveId(formData.driveLink);

    if (!driveId) {
      setFormData((prev) => ({ ...prev, isOverridden: false }));
      return;
    }

    const checkExistingDrive = async () => {
      try {
        const documents = await fetchStudentDocuments();
        const hasMatchingDriveId = documents.some((doc) => doc.drive_id === driveId);
        if (isMounted) {
          setFormData((prev) => ({ ...prev, isOverridden: hasMatchingDriveId ? true : prev.isOverridden || false }));
        }
      } catch (error) {
        console.error('Error checking existing drive id:', error);
      }
    };

    checkExistingDrive();

    return () => {
      isMounted = false;
    };
  }, [formData.driveLink]);

  const blockOptions = keywordConfigs.filter((config) => config.config_type === 'block_mapping').map((config) => config.label);
  const categoryOptions = keywordConfigs.filter((config) => config.config_type === 'doc_type').map((config) => config.label);
  const boardExamOptions = keywordConfigs.filter((config) => config.config_type === 'board_exam').map((config) => config.label);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ ...formData, thumbnail: thumbnailPreview });
      // Reset form
      setFormData({
        blockName: '',
        blockCode: '',
        generation: 'MDCU 81',
        block: blockOptions[0] || 'Block 1',
        category: categoryName || categoryOptions[0] || 'AC',
        boardExam: boardExamOptions[0] || '',
        driveLink: '',
        thumbnail: '',
        isOverridden: false,
      });
      setThumbnailPreview('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>
            Fill in the details for the new academic resource. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Block Name */}
            <div className="space-y-2">
              <Label htmlFor="blockName">Block Name *</Label>
              <Input
                id="blockName"
                placeholder="e.g., Cardiovascular System"
                value={formData.blockName}
                onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                required
              />
            </div>

            {/* Block Code */}
            <div className="space-y-2">
              <Label htmlFor="blockCode">Block Code</Label>
              <Input
                id="blockCode"
                placeholder="e.g., CV-101"
                value={formData.blockCode}
                onChange={(e) => setFormData({ ...formData, blockCode: e.target.value })}
              />
            </div>

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
                    <SelectItem value="MDCU 81">MDCU 81</SelectItem>
                    <SelectItem value="MDCU 80">MDCU 80</SelectItem>
                    <SelectItem value="MDCU 79">MDCU 79</SelectItem>
                    <SelectItem value="MDCU 78">MDCU 78</SelectItem>
                    <SelectItem value="MDCU 77">MDCU 77</SelectItem>
                    <SelectItem value="MDCU 76">MDCU 76</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="block">Block *</Label>
                <Select
                  value={formData.block}
                  onValueChange={(value: any) => setFormData({ ...formData, block: value })}
                >
                  <SelectTrigger id="block">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blockOptions.length > 0 ? (
                      blockOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="Block 1">Block 1</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length > 0 ? (
                    categoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="Peer Tutoring">Peer Tutoring</SelectItem>
                      <SelectItem value="Summary">Summary</SelectItem>
                      <SelectItem value="Mock Exam">Mock Exam</SelectItem>
                      <SelectItem value="Resources">Resources</SelectItem>
                      <SelectItem value="Survival Guide">Survival Guide</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Board Exam */}
            <div className="space-y-2">
              <Label htmlFor="boardExam">Board Exam</Label>
              <Select
                value={formData.boardExam || ''}
                onValueChange={(value: any) => setFormData({ ...formData, boardExam: value })}
              >
                <SelectTrigger id="boardExam">
                  <SelectValue placeholder="Select board exam" />
                </SelectTrigger>
                <SelectContent>
                  {boardExamOptions.length > 0 ? (
                    boardExamOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="">None</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Override Toggle */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isOverridden)}
                  onChange={(e) => setFormData({ ...formData, isOverridden: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#E5007D] focus:ring-[#E5007D]"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Use manual override for this resource</span>
                  <br />
                  This turns on the override flag when the same Google Drive ID already exists, and you can switch it off to return to keyword-based classification.
                </span>
              </label>
            </div>

            {/* Google Drive Link */}
            <div className="space-y-2">
              <Label htmlFor="driveLink">Google Drive Link *</Label>
              <Input
                id="driveLink"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.driveLink}
                onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                required
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image *</Label>
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
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    required={!thumbnailPreview}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Upload a thumbnail image for this resource (JPG, PNG, max 5MB)
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
                  Adding...
                </>
              ) : (
                'Add Resource'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
