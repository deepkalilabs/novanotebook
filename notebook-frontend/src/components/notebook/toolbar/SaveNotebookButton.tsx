'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface SaveNotebookButtonProps {
  onHandleSave: (filename: string) => Promise<any>;
}

export function SaveNotebookButton({ onHandleSave }: SaveNotebookButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [filename, setFilename] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = async () => {
    if (!filename.trim()) return;
    
    setIsSaving(true);
    try {
      await onHandleSave(filename);
    } finally {
      setIsSaving(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Notebook</DialogTitle>
          <DialogDescription>
            Enter a filename for your notebook
          </DialogDescription>
        </DialogHeader>
        <Input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="notebook.ipynb"
        />
        <DialogFooter>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 