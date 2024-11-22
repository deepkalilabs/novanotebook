'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface LoadNotebookButtonProps {
  onHandleLoad: (filename: string) => Promise<void>;
}

export function LoadNotebookButton({ onHandleLoad }: LoadNotebookButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [filename, setFilename] = useState('testground.ipynb');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLoad = async () => {
    if (!filename.trim()) return;
    
    setIsLoading(true);
    try {
      await onHandleLoad(filename);
      setIsDialogOpen(false);
      setFilename('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Load
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Notebook</DialogTitle>
          <DialogDescription>
            Enter the filename of the notebook to load
          </DialogDescription>
        </DialogHeader>
        <Input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="notebook.ipynb"
        />
        <DialogFooter>
          <Button 
            onClick={handleLoad}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 