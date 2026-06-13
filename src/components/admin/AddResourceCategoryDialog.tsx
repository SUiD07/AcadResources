import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';

interface AddResourceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResourceCategoryFormData) => Promise<void>;
}

export interface ResourceCategoryFormData {
  title: string;
  description: string;
  icon: string;
  link: string;
  items: { name: string; type: string }[];
}

export function AddResourceCategoryDialog({ open, onOpenChange, onSubmit }: AddResourceCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ResourceCategoryFormData>({
    title: '',
    description: '',
    icon: 'BookOpen',
    link: '',
    items: [{ name: '', type: 'PDF' }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        icon: 'BookOpen',
        link: '',
        items: [{ name: '', type: 'PDF' }],
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', type: 'PDF' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: 'name' | 'type', value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Resource Category</DialogTitle>
          <DialogDescription>
            Create a new academic resource category with items.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="category-title">Category Title *</Label>
              <Input
                id="category-title"
                placeholder="e.g., Textbooks & References"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="category-description">Description *</Label>
              <Textarea
                id="category-description"
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                required
              />
            </div>

            {/* Icon and Link - Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-icon">Icon *</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value:any) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger id="category-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BookOpen">Book Open</SelectItem>
                    <SelectItem value="FileText">File Text</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="LinkIcon">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-link">Resource Link *</Label>
                <Input
                  id="category-link"
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Resource Items</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addItem}
                  className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Select
                      value={item.type}
                      onValueChange={(value:any) => updateItem(index, 'type', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Link">Link</SelectItem>
                        <SelectItem value="Doc">Doc</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeItem(index)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
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
                'Add Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
