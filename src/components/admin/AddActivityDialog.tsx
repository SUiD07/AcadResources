import { useState } from "react";
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
import { Loader2 } from "lucide-react";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityFormData) => Promise<void>;
}

export interface ActivityFormData {
  title: string;
  description: string;
  date: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  icon: string;
}

export function AddActivityDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddActivityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: "",
    description: "",
    date: "",
    status: "Upcoming",
    icon: "Calendar",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        status: "Upcoming",
        icon: "Calendar",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Create a new academic activity or event. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="activity-title">Activity Title *</Label>
              <Input
                id="activity-title"
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
              <Label htmlFor="activity-description">Description *</Label>
              <Textarea
                id="activity-description"
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
              <Label htmlFor="activity-date">Date & Time *</Label>
              <Input
                id="activity-date"
                type="text"
                placeholder="e.g., Dec 5, 2025 - 2:00 PM"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
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
                  Adding...
                </>
              ) : (
                "Add Activity"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
