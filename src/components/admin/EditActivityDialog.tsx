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
import { Loader2, Upload, X } from "lucide-react";
import type { ActivityFormData } from "./AddActivityDialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ImageWithFallback } from "../figma/ImageWithFallback";
// import { ActivityImageUpload } from "./ActivityImageUpload";
import { supabase } from "../../lib/supabase";

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormData & { id: string }) => Promise<void>;
  initialData?: ActivityFormData & { id: string };
}

export function EditActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: EditActivityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData & { id: string }>({
    id: "",
    title: "",
    description: "",
    date: "",
    status: "Upcoming",
    icon: "Calendar",
    image_url: null,
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setThumbnailPreview(initialData.image_url || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ ...formData, image_url: thumbnailPreview || null });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const filePath = `activities/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("activity-images")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage
        .from("activity-images")
        .getPublicUrl(filePath);
      setThumbnailPreview(data.publicUrl);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    } finally {
      setIsUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Update the details for this academic activity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-activity-title">Activity Title *</Label>
              <Input
                id="edit-activity-title"
                placeholder="e.g., Peer Tutoring Session"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-activity-description">Description *</Label>
              <Textarea
                id="edit-activity-description"
                placeholder="Brief description of the activity..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-activity-date">Date & Time *</Label>
              {/* <Input
                id="edit-activity-date"
                type="text"
                placeholder="e.g., Dec 5, 2025 - 2:00 PM"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              /> */}
              <DatePicker
                selected={formData.date}
                onChange={(date: any) =>
                  setFormData({
                    ...formData,
                    date,
                  })
                }
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Select date and time"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                popperPlacement="bottom-start"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activity-thumbnail">Thumbnail Image (optional)</Label>
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
                      onClick={() => setThumbnailPreview("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                    {isUploadingThumbnail ? (
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="edit-activity-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingThumbnail}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Upload a cover image for this activity (optional)
                  </p>
                </div>
              </div>
            </div>

            {/* Status and Icon - Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity-status">Status *</Label>
                <select
                  id="activity-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "Upcoming"
                        | "Ongoing"
                        | "Completed",
                    })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-icon">Icon *</Label>
                <select
                  id="activity-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="Calendar">Calendar</option>
                  <option value="Users">Users</option>
                  <option value="Award">Award</option>
                  <option value="BookOpen">Book Open</option>
                </select>
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
