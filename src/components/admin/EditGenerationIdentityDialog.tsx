import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { GenerationMeta } from '../section/eBoardSection';

interface EditGenerationIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: GenerationMeta;
  onSave: (updated: GenerationMeta) => void;
}

export function EditGenerationIdentityDialog({ open, onOpenChange, meta, onSave }: EditGenerationIdentityDialogProps) {
  const [draft, setDraft] = useState<GenerationMeta>(meta);

  useEffect(() => {
    setDraft(meta);
  }, [meta]);

  const update = (field: keyof GenerationMeta) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {meta.label} Identity</DialogTitle>
          <DialogDescription>Customize how this generation appears on the board.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="identity-year">Year</Label>
              <Input id="identity-year" value={draft.year} onChange={update('year')} placeholder="Class of 2031" />
            </div>
            <div>
              <Label htmlFor="identity-emoji">Emoji</Label>
              <Input id="identity-emoji" value={draft.emoji} onChange={update('emoji')} maxLength={4} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="identity-tagline">Tagline</Label>
              <Input id="identity-tagline" value={draft.tagline} onChange={update('tagline')} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="identity-accent">Accent color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="identity-accent"
                  type="color"
                  value={draft.accentHex}
                  onChange={update('accentHex')}
                  className="w-14 p-1"
                />
                <Input value={draft.accentHex} onChange={update('accentHex')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E5007D] hover:bg-[#C1006A] text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
