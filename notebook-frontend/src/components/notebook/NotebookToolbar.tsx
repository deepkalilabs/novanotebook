// components/NotebookToolbar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NotebookCell } from '@/app/types';
import { ShowCodeButton } from './toolbar/ShowCodeButton';
import { SaveNotebookButton } from './toolbar/SaveNotebookButton';
import { LoadNotebookButton } from './toolbar/LoadNotebookButton';
import { DeployButton } from './toolbar/DeployButton';
import { RestartKernelButton } from './toolbar/RestartKernelButton';

interface NotebookToolbarProps {
  onHandleAddCell: () => void;
  onHandleSave: (filename: string) => Promise<void>;
  onHandleLoad: (filename: string) => Promise<void>;
  onHandleRestartKernel?: () => Promise<void>;
  isConnected: boolean;
  allCells: NotebookCell[];
  onHandleDeploy?: () => Promise<void>;
}

//TODO: Add name and description to the toolbar
export function NotebookToolbar({
  onHandleAddCell,
  onHandleSave,
  onHandleLoad,
  onHandleRestartKernel,
  isConnected,
  allCells,
  onHandleDeploy,
}: NotebookToolbarProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex items-center gap-6 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium">Name:</span>
          <span className="text-foreground">DatasetEnrich</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onHandleAddCell}
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Cell
      </Button>

      <SaveNotebookButton onHandleSave={onHandleSave} />
      <LoadNotebookButton onHandleLoad={onHandleLoad} />

      <ShowCodeButton allCells={allCells} />
      
      <RestartKernelButton 
        onHandleRestartKernel={onHandleRestartKernel}
        isConnected={isConnected}
      />

      <DeployButton 
        onDeploy={onHandleDeploy}
        isConnected={isConnected}
        disabled={allCells.length === 0}
      />

      {!isConnected && (
        <div className="text-sm text-muted-foreground">
          Not connected to kernel
        </div>
      )}
    </div>
  );
}