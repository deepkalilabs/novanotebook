// hooks/useNotebookConnection.ts
'use client';

import { useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import { NotebookCell } from '@/app/types';

interface NotebookConnectionProps {
  onOutput: (cellId: string, output: string) => void;
  onNotebookLoaded?: (cells: NotebookCell[]) => void;
  onNotebookSaved?: () => void;
  onError?: (error: string) => void;
}

export function useNotebookConnection({
  onOutput,
  onNotebookLoaded,
  onNotebookSaved,
  onError
}: NotebookConnectionProps) {
  const sessionId = uuidv4();
  const socketUrl = `ws://localhost:8000/ws/${sessionId}`;

  const {
    sendMessage,
    lastMessage,
    readyState
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Connected to Python kernel'),
    onClose: () => console.log('Disconnected from Python kernel'),
    onError: () => onError?.('Failed to connect to Python kernel'),
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  const handleMessage = useCallback((message: string) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'output':
          onOutput(data.cellId, data.output);
          break;
        case 'notebook_loaded':
          onNotebookLoaded?.(data.cells);
          break;
        case 'notebook_saved':
          onNotebookSaved?.();
          break;
        case 'error':
          onError?.(data.message);
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [onOutput, onNotebookLoaded, onNotebookSaved, onError]);

  if (lastMessage !== null) {
    handleMessage(lastMessage.data);
  }

  const executeCode = useCallback((cellId: string, code: string) => {
    sendMessage(JSON.stringify({
      type: 'execute',
      cellId,
      code
    }));
  }, [sendMessage]);

  const saveNotebook = useCallback((filename: string, cells: NotebookCell[]) => {
    sendMessage(JSON.stringify({
      type: 'save',
      filename,
      cells
    }));
  }, [sendMessage]);

  const loadNotebook = useCallback((filename: string) => {
    sendMessage(JSON.stringify({
      type: 'load',
      filename
    }));
  }, [sendMessage]);

  const restartKernel = useCallback(() => {
    sendMessage(JSON.stringify({
      type: 'restart'
    }));
    return Promise.resolve(); // Returns a promise to match the interface expected by the toolbar
  }, [sendMessage]);

  return {
    executeCode,
    saveNotebook,
    loadNotebook,
    restartKernel,
    isConnected: readyState === ReadyState.OPEN,
    connectionStatus: {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Connected',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Disconnected',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState]
  };
}