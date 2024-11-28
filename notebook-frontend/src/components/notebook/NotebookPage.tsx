"use client";
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
//import { ToastAction } from "@/components/ui/toast"
import { useNotebookStore } from '@/app/store';
import { useNotebookConnection } from '@/hooks/useNotebookConnection';
import { NotebookToolbar } from '@/components/notebook/NotebookToolbar';
import { NotebookCell } from '@/components/notebook/NotebookCell';
import { OutputDeployMessage } from '@/app/types';
import DeploymentDialog from '@/components/notebook/NotebookDeploy';
import NotebookPageSidebar from '@/components/notebook/Sidebar';

export default function NotebookPage({ notebookId }: { notebookId: string }) {
  const { toast } = useToast();
  const { cells, addCell, updateCellCode, updateCellOutput, deleteCell, moveCellUp, moveCellDown, setCells } = useNotebookStore();
  const [ isDeploying, setIsDeploying ] = useState(false);
  const [ deploymentData, setDeploymentData] = useState<OutputDeployMessage>({} as OutputDeployMessage);

  const {
    executeCode,
    saveNotebook,
    loadNotebook,
    restartKernel,
    deployCode,
    isConnected,
    connectionStatus
  } = useNotebookConnection({
    onOutput: updateCellOutput,
    onNotebookLoaded: (cells) => {
      setCells(cells);
      toast({
        title: 'Notebook loaded',
        description: 'Successfully loaded notebook'
      });
    },
    onNotebookSaved: (data) => {
      if (data.success) {
        console.log(`Toasting: Received notebook_saved: ${data.type}, success: ${data.success}, message: ${data.message}`);
        // TODO: Toast doesn't work
        toast({
          title: 'Notebook saved',
          description: `Successfully saved notebook. ${data.message}`,
        });
      } else {
        toast({
          title: 'Notebook save failed',
          description: `Failed to save notebook. ${data.message}`,
          variant: 'destructive'
        });
      }
    },
    onNotebookDeployed: (data) => {
      console.log(`Received notebook_deployed: ${data.type}, success: ${data.success}, message: ${data.message}`);
      setDeploymentData(data);
      setIsDeploying(true);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    // Show connection status changes
    if (!isConnected) {
      toast({
        title: 'Kernel Status',
        description: connectionStatus,
        variant: 'destructive'
      });
    }
  }, [isConnected, connectionStatus, toast]);

  const handleExecute = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    updateCellOutput(cellId, '');
    executeCode(cellId, cell.code);
  };

  const handleSave = async (filename: string) => {
    saveNotebook(cells, filename);
  };

  const handleLoad = async (filename: string) => {
    loadNotebook(filename);
  };

  const handleDeploy = async () => {
    deployCode(cells)
  }

  console.log(notebookId);

  return (
    <div className="flex min-h-screen">
      <div className="container mx-auto py-8">
      { isDeploying && (
          <DeploymentDialog
            isOpen={isDeploying}
            onOpenChange={setIsDeploying}
            data={deploymentData}
          />
        )
      }

      <div className="sticky top-0 z-50 bg-background py-2 border-b">
        <NotebookToolbar
          onHandleAddCell={addCell}
          onHandleSave={handleSave}
          onHandleLoad={handleLoad}
          onHandleRestartKernel={restartKernel}
          isConnected={isConnected}
          allCells={cells}
          onHandleDeploy={handleDeploy}
        />
      </div>

      <div className="space-y-6">
        {cells.map((cell) => (
          <NotebookCell
            key={cell.id}
            id={cell.id}
            code={cell.code}
            output={cell.output}
            executionCount={cell.executionCount}
            isExecuting={false}
            onCodeChange={(code) => updateCellCode(cell.id, code )}
            onExecute={() => handleExecute(cell.id)}
            onDelete={() => deleteCell(cell.id)}
            onMoveUp={() => moveCellUp(cell.id)}
            onMoveDown={() => moveCellDown(cell.id)}
          />
        ))}
        
        {cells.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No cells yet. Click Add Cell to create one.
            </div>
          )} 
        </div>
      </div>
    </div>
  );
}