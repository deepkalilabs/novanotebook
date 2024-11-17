// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { NotebookCell } from '@/components/notebook/NotebookCell';
import { NotebookToolbar } from '@/components/notebook/NotebookToolbar';
import { useNotebookStore } from '@/app/store';
import { useNotebookConnection } from '@/hooks/useNotebookConnection';
import { ReadyState } from 'react-use-websocket';

export default function NotebookPage() {
  const toast = useToast();
  const { cells, addCell, updateCellCode, updateCellOutput, deleteCell, moveCellUp, moveCellDown, setCells } = useNotebookStore();
  const isConnected = true
  const connectionStatus = ReadyState.OPEN
  
  // const {
  //   executeCode,
  //   saveNotebook,
  //   loadNotebook,
  //   restartKernel,
  //   isConnected,
  //   connectionStatus
  // } = useNotebookConnection({
  //   onOutput: (cellId, output) => {
  //     updateCellOutput(cellId, output);
  //   },
  //   onNotebookLoaded: (cells) => {
  //     setCells(cells);
  //     toast.toast({
  //       title: 'Notebook loaded',
  //       description: 'Successfully loaded notebook'
  //     });
  //   },
  //   onNotebookSaved: () => {
  //     toast.toast({
  //       title: 'Notebook saved',
  //       description: 'Successfully saved notebook'
  //     });
  //   },
  //   onError: (error) => {
  //     toast.toast({
  //       title: 'Error',
  //       description: error,
  //       variant: 'destructive'
  //     });
  //   }
  // });

  useEffect(() => {
    // Show connection status changes
    if (!isConnected) {
      toast.toast({
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
    // await executeCode(cellId, cell.code);
  };

  const handleSave = async (filename: string) => {
    // await saveNotebook(filename, cells);
  };

  const handleLoad = async (filename: string) => {
    // await loadNotebook(filename);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Python Notebook</h1>
      </div>

      <NotebookToolbar
        onAddCell={addCell}
        onSave={handleSave}
        onLoad={handleLoad}
        // onRestartKernel={restartKernel}
        isConnected={isConnected}
        allCells={cells}
      />

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
            No cells yet. Click "Add Cell" to create one.
          </div>
        )} 
      </div>
    </div>
  );
}