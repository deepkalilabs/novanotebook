// hooks/useNotebookConnection.ts
'use client';

import { useCallback, useRef, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';
import { NotebookCell } from '@/app/types';
import { OutputExecutionMessage, OutputSaveMessage, OutputLoadMessage } from '@/app/types';


interface NotebookConnectionProps {
  onOutput: (cellId: string, output: string) => void;
  onNotebookLoaded: (cells: NotebookCell[]) => void;
  onNotebookSaved: (data: OutputSaveMessage) => void;
  onError?: (error: string) => void;
}

export function useNotebookConnection({
  onOutput,
  onNotebookLoaded,
  onNotebookSaved,
  onError
}: NotebookConnectionProps) {

  const setupSocketUrl = useCallback(() => {
    const sessionId = useRef(uuidv4()).current;
    const socketBaseURL = process.env.NODE_ENV === 'development' ? '0.0.0.0' : process.env.NEXT_PUBLIC_AWS_EC2_IP;

    let socketUrl = '';

    if (process.env.NODE_ENV === 'development') {
      socketUrl = `ws://0.0.0.0:8000/ws/${sessionId}`;
      // console.log(`Socket URL: ${socketUrl}, sessionId: ${sessionId}, socketURL: ${socketBaseURL}`);
    } else {
      socketUrl = `wss://${process.env.NEXT_PUBLIC_AWS_EC2_IP}/ws/${sessionId}`;
      // console.log(`Socket URL: ${socketUrl}, sessionId: ${sessionId}`);
    }

    return socketUrl;
  }, []);

  const socketUrl = setupSocketUrl();

  const {
    sendMessage,
    lastMessage,
    readyState
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Connected to Python kernel'),
    onClose: () => console.log('Disconnected from Python kernel'),
    onError: () => onError?.('Failed to connect to Python kernel'),
    // shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      console.log(`Received message: ${lastMessage.data}`);
      let parsedData = null;
      switch (data.type) {
        case 'output':
          parsedData = data as OutputExecutionMessage;
          console.log(`Received output: ${parsedData.output}, type: ${typeof parsedData.type}, cellId: ${parsedData.cellId}`);
          onOutput(parsedData.cellId, parsedData.output);
          break;
        case 'notebook_loaded':
          parsedData = data as OutputLoadMessage;
          console.log(`Received notebook_loaded: ${parsedData.type}, success: ${parsedData.success}, message: ${parsedData.message}`);
          onNotebookLoaded(parsedData.cells);
          break;
        case 'notebook_saved':
          parsedData = data as OutputSaveMessage;
          console.log(`Received notebook_saved: ${parsedData.type}, success: ${parsedData.success}, message: ${parsedData.message}`);
          onNotebookSaved(parsedData);
          break;
        case 'error':
          onError?.(data.message);
          break;
      }
    }
  }, [lastMessage]);

  const executeCode = (cellId: string, code: string) => {
    sendMessage(JSON.stringify({
      type: 'execute',
      cellId,
      code
    }));
    onOutput(cellId, 'Loading....');
  };

  const saveNotebook = (cells: NotebookCell[], filename: string) => {
    sendMessage(JSON.stringify({
      type: 'save_notebook',
      cells: cells,
      filename: filename
    }));
  };

  const loadNotebook = useCallback((filename: string) => {
    sendMessage(JSON.stringify({
      type: 'load_notebook',
      filename: filename
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