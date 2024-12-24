"use client";
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator';
import { useNotebookStore } from '@/app/store';
import { useNotebookConnection } from '@/hooks/useNotebookConnection';
import { NotebookToolbar } from '@/components/notebook/NotebookToolbar';
import { NotebookCell } from '@/components/notebook/NotebookCell';
import { OutputDeployMessage, CellType, NotebookPageProps } from '@/app/types';
import DeploymentDialog from '@/components/notebook/NotebookDeploy';


export default function NotebookPage({ notebookId, userId, name }: NotebookPageProps) {
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
    connectionStatus,
    posthogSetup
  } = useNotebookConnection({
    onOutput: updateCellOutput,
    onNotebookLoaded: (cells) => {
      setCells(cells);
      toast({
        title: 'Notebook loaded',
        description: 'Successfully loaded notebook',
        variant: "default",
        duration: 1000
      });
    },
    onNotebookSaved: (data) => {
      if (data.success) {
        console.log(`Toasting: Received notebook_saved: ${data.type}, success: ${data.success}, message: ${data.message}`);
        toast({
          title: "Notebook saved",
          description: data.message,
          variant: "default",
          duration: 1000
        });
      } else {
        toast({
          title: "Failed to save",
          description: data.message,
          variant: "destructive"
        });
      }
    },
    onNotebookDeployed: (data) => {
      console.log(`Received notebook_deployed: ${data.type}, success: ${data.success}, message: ${data.message}`);
      setIsDeploying(true);
      setDeploymentData(data);
    },
    onError: (error) => {
      toast({
        title: "Failed to deploy",
        description: error,
        variant: "destructive"
      });
    },
    notebookDetails: {
      notebookId: notebookId,
      userId: userId,
      name: name
    }
  });

  useEffect(() => {
    // Show connection status changes
    if (!isConnected) {
      toast({
        title: 'Kernel Status',
        description: connectionStatus,
        variant: 'destructive',
        duration: 2000
      });
    }
  }, [isConnected, connectionStatus, toast]);

  useEffect(() => {
    if (isConnected) {
      loadNotebook(name, notebookId, userId);
    }
  }, [isConnected]);

  const handleExecute = async (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    updateCellOutput(cellId, '');
    executeCode(cellId, cell.code);
  };

  const handleSave = async (filename: string) => {
    saveNotebook(cells, filename, notebookId, userId);
  };

  const handleLoad = async (filename: string) => {
    loadNotebook(filename, notebookId, userId);
  };

  const handleDeploy = async () => {
    deployCode(cells, userId, name, notebookId)
  }


  return (
    <div className="flex min-h-screen">
      <div className="container mx-auto py-8">
        <Tabs defaultValue="notebook" className="w-full">

          <TabsContent value="notebook">
            { isDeploying && (
              <DeploymentDialog
                isOpen={isDeploying}
                onOpenChange={setIsDeploying}
                data={deploymentData}
              />
            )}

            <div className="sticky top-0 z-50 bg-background py-2">
              <NotebookToolbar
                name={name}
                onHandleAddCell={(type: CellType) => {
                  addCell(type)
                  handleSave(name)
                }}
                onHandleSave={handleSave}
                onHandleLoad={handleLoad}
                onHandleRestartKernel={restartKernel}
                isConnected={isConnected}
                allCells={cells}
                onHandleDeploy={handleDeploy}
                posthogSetup={posthogSetup}
              />
            </div>

            <Separator className="my-2" />
            <br/>


            <div className="space-y-6">
              {cells.map((cell) => (
                <NotebookCell
                  key={cell.id}
                  id={cell.id}
                  code={cell.code}
                  output={cell.output}
                  type={cell.type}
                  executionCount={cell.executionCount}
                  isExecuting={false}
                  onCodeChange={(code) => updateCellCode(cell.id, code)}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}