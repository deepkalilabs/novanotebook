// components/NotebookToolbar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { 
  PlusCircle, 
  Save, 
  FolderOpen, 
  RotateCcw,
  Loader2,
  Layers3
} from 'lucide-react';
import { NotebookCell } from '@/app/types';
import dynamic from 'next/dynamic';
interface NotebookToolbarProps {
  onAddCell: () => void;
  onSave: (filename: string) => Promise<void>;
  onLoad: (filename: string) => Promise<void>;
  onRestartKernel?: () => Promise<void>;
  isConnected: boolean;
  allCells: NotebookCell[];
}

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

export function NotebookToolbar({
  onAddCell,
  onSave,
  onLoad,
  onRestartKernel,
  isConnected,
  allCells
}: NotebookToolbarProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [filename, setFilename] = useState('');
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setLoadDialogOpen] = useState(false);
  const [allCode, setAllCode] = useState('');
  const [isCodeSheetOpen, setIsCodeSheetOpen] = useState(false);

  const handleSave = async () => {
    if (!filename.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(filename);
      setSaveDialogOpen(false);
      setFilename('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async () => {
    if (!filename.trim()) return;
    
    setIsLoading(true);
    try {
      await onLoad(filename);
      setLoadDialogOpen(false);
      setFilename('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartKernel = async () => {
    setIsRestarting(true);
    try {
      await onRestartKernel();
    } finally {
      setIsRestarting(false);
    }
  };

  const showAllCode = () => {
    const code = allCells.map((cell) => cell.code).join('\n');
    setAllCode(code);
    setIsCodeSheetOpen(true);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button 
        onClick={onAddCell}
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Cell
      </Button>

      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
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

      <Dialog open={isLoadDialogOpen} onOpenChange={setLoadDialogOpen}>
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

      <Sheet open={isCodeSheetOpen} onOpenChange={setIsCodeSheetOpen}>
        <SheetContent side='right' className='w-3/4 sm:max-w-3/4'>
          <SheetHeader>
            <div className='flex flex-row gap-2 py-4'>
              <Button>All Code</Button>
            </div>
          </SheetHeader>
          <MonacoEditor
            value={allCode}
            language="python"
            options={{ readOnly: true }}
            height="90vh"
          />
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        className="gap-2"
        onClick={handleRestartKernel}
        disabled={!isConnected || isRestarting}
      >
        {isRestarting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Restarting...
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            Restart Kernel
          </>
        )}
      </Button>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => showAllCode()}
        disabled={allCells.length === 0}
      >
        <Layers3 className="h-4 w-4" />
        Show All Code
      </Button>

      {!isConnected && (
        <div className="text-sm text-muted-foreground">
          Not connected to kernel
        </div>
      )}
    </div>
  );
}