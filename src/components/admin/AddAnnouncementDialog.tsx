import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { CustomEditor } from './CustomEditor';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAnnouncementDialog({ open, onOpenChange }: AddAnnouncementDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [generation, setGeneration] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const generations = ['MDCU 81', 'MDCU 80', 'MDCU 79', 'MDCU 78', 'MDCU 77', 'MDCU 76'];

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
      // const newAnnouncement = {
      //   generation,
      //   title,
      //   content,
      //   isPinned,
      //   author: 'Admin ' + generation,
      //   createdAt: new Date(),
      // };

      toast.success('Announcement created successfully!');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create announcement');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setGeneration('');
    setContent('');
    setIsPinned(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>Fill in the details to post a new announcement for a generation.</DialogDescription>
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
                  Creating...
                </>
              ) : (
                'Create Announcement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
