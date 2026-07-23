import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import type { ResourceCategoryFormData } from "./AddResourceCategoryDialog";
import { ResourceImageUpload } from "./ResourceImageUpload";

interface EditResourceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResourceCategoryFormData & { id: string }) => Promise<void>;
  initialData?: ResourceCategoryFormData & { id: string };
}

export function EditResourceCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: EditResourceCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<
    ResourceCategoryFormData & { id: string }
  >({
    id: "",
    title: "",
    description: "",
    icon: "BookOpen",
    link: "",
    image_url: null,
    items: [{ id: crypto.randomUUID(), name: "", type: "PDF" }],
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: crypto.randomUUID(), name: "", type: "PDF" },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: "name" | "type", value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resource Category</DialogTitle>
          <DialogDescription>
            Update the details for this academic resource category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-category-title">Category Title *</Label>
              <Input
                id="edit-category-title"
                placeholder="e.g., Textbooks & References"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description *</Label>
              <Textarea
                id="edit-category-description"
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>รูปปกหมวดหมู่</Label>
              <ResourceImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>

            {/* Icon and Link - Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-icon">Icon *</Label>
                <select
                  id="edit-category-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="BookOpen">Book Open</option>
                  <option value="FileText">File Text</option>
                  <option value="Video">Video</option>
                  <option value="LinkIcon">Link</option>
                </select>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="edit-category-link">Resource Link *</Label>
                <Input
                  id="edit-category-link"
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  required
                />
              </div> */}
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
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                      required
                      className="flex-1"
                    />
                    <select
                      value={item.type}
                      onChange={(e) =>
                        updateItem(index, "type", e.target.value)
                      }
                      className="w-24 border border-input bg-background rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Video">Video</option>
                      <option value="Link">Link</option>
                      <option value="Doc">Doc</option>
                    </select>
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
