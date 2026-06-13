import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { CustomEditor } from './CustomEditor';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Announcement } from '../section/BoardSection';

interface EditAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement;
}

export function EditAnnouncementDialog({ open, onOpenChange, announcement }: EditAnnouncementDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [generation, setGeneration] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const generations = ['MDCU 81', 'MDCU 80', 'MDCU 79', 'MDCU 78', 'MDCU 77', 'MDCU 76'];

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setGeneration(announcement.generation);
      setContent(announcement.content);
      setIsPinned(announcement.isPinned);
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !generation || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Add Supabase integration when USE_SUPABASE is true
      // const updatedAnnouncement = {
      //   ...announcement,
      //   generation,
      //   title,
      //   content,
      //   isPinned,
      // };

      toast.success('Announcement updated successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update announcement');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>Update the announcement details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>

            {/* Generation */}
            <div>
              <Label htmlFor="generation">Generation *</Label>
              <Select value={generation} onValueChange={setGeneration} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select generation" />
                </SelectTrigger>
                <SelectContent>
                  {generations.map(gen => (
                    <SelectItem key={gen} value={gen}>{gen}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pin Announcement */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <Label htmlFor="pinned" className="cursor-pointer">Pin this announcement</Label>
              <Switch
                id="pinned"
                checked={isPinned}
                onCheckedChange={setIsPinned}
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label>Content *</Label>
            <div className="mt-2">
              <CustomEditor
                content={content}
                onChange={setContent}
                placeholder="Write your announcement here..."
              />
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
              className="bg-[#E5007D] hover:bg-[#C1006A] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
