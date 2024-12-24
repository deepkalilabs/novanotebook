// hooks/useNotebookConnection.ts
'use client';

import { useCallback, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';

import { NotebookCell, OutputDeployMessage, NotebookConnectionProps } from '@/app/types';
import { OutputExecutionMessage, OutputSaveMessage, OutputLoadMessage, OutputPosthogSetupMessage } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
import { useConnectorsStore } from '@/app/store';

export function useNotebookConnection({
  onOutput,
  onNotebookLoaded,
  onNotebookSaved,
  onNotebookDeployed,
  onError,
  notebookDetails,
  onPosthogSetup

}: NotebookConnectionProps) {
  const { toast } = useToast();
  const { connectors, setConnectors } = useConnectorsStore();
  const sessionId = useRef(uuidv4()).current;
  const notebookId = notebookDetails?.notebookId
  console.log("details", notebookId)

  const setupSocketUrl = useCallback(() => {
    const socketBaseURL = process.env.NODE_ENV === 'development' ? '0.0.0.0' : process.env.NEXT_PUBLIC_AWS_EC2_IP;

    const socketUrl = process.env.NODE_ENV === 'development'
    ? `ws://0.0.0.0:8000/ws/${sessionId}/${notebookId}`
    : `wss://${socketBaseURL}/ws/${sessionId}/${notebookId}`;

    console.log("socketUrl", socketUrl)
    return socketUrl;
  }, [sessionId, notebookId]);

  const socketUrl = setupSocketUrl();

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl, {
    onOpen: () => {
      toast({
        title: "Connected to Python kernel",
        description: "Successfully connected to Python kernel"
      });
    },
    onClose: () => {
      toast({
        title: "Disconnected from Python kernel",
        description: "Disconnected from Python kernel"
      });
    },
    onError: (event) => {
      console.log("onError", event);
      onError?.("Failed to connect to Python kernel");
    },
    shouldReconnect: () => true,
    reconnectAttempts: 3,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      let parsedData = null;
      switch (data.type) {
        case "init":
          toast({
            title: "Initializing Kernel. Please wait.",
            description: "Loading kernel."
          });
        case 'output':
          parsedData = data as OutputExecutionMessage;
          console.log(`Received output: ${parsedData.output}, type: ${typeof parsedData.type}, cellId: ${parsedData.cellId}`);
          onOutput?.(parsedData.cellId, parsedData.output);
          break;
        case 'notebook_loaded':
          parsedData = data as OutputLoadMessage;
          console.log(`Received notebook_loaded: ${parsedData.type}, success: ${parsedData.success}, message: ${parsedData.message}`);
          onNotebookLoaded?.(parsedData.cells);
          break;
        case 'notebook_saved':
          parsedData = data as OutputSaveMessage;
          console.log(`Received notebook_saved: ${parsedData.type}, success: ${parsedData.success}, message: ${parsedData.message}`);
          onNotebookSaved?.(parsedData);
          break;
        case 'lambda_generated':
          parsedData = data as OutputDeployMessage;
          console.log(`Received lambda_generated: ${parsedData.type}, success: ${parsedData.success}, message: ${parsedData.message}`);
          onNotebookDeployed?.(parsedData);
          break;
        case 'posthog_setup':
          parsedData = data as OutputPosthogSetupMessage;
          console.log(`Received posthog_setup: ${parsedData.type}, success: ${parsedData.success}, message: ${parsedData.message}, output: ${parsedData?.output}`);
          onPosthogSetup?.(parsedData);
          // Make the output available on zustand if successful
          alert(parsedData);
          if (parsedData.success) {
            console.log("Adding connector to zustand");
            setConnectors([...connectors, parsedData]);
          }
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
    onOutput?.(cellId, 'Loading....');
  };

  const saveNotebook = (cells: NotebookCell[], filename: string, notebook_id: string, user_id: string) => {
    sendMessage(JSON.stringify({
      type: 'save_notebook',
      cells: cells,
      filename: filename,
      notebook_id: notebook_id,
      user_id: user_id
    }));
  };

  const loadNotebook = useCallback((filename: string, notebook_id: string, user_id: string) => {
    sendMessage(JSON.stringify({
      type: 'load_notebook',
      filename: filename,
      notebook_id: notebook_id,
      user_id: user_id
    }));
  }, [sendMessage]);


  const restartKernel = useCallback(() => {
    sendMessage(JSON.stringify({
      type: 'restart'
    }));
    return Promise.resolve(); // Returns a promise to match the interface expected by the toolbar
  }, [sendMessage]);

  const deployCode = useCallback((cells: NotebookCell[], user_id: string, name: string, notebook_id: string) => {
    // TODO: Change the default name
    sendMessage(JSON.stringify({
      type: 'deploy_lambda',
      all_code: cells.map((cell) => cell.code).join('\n'),
      user_id: user_id,
      notebook_name: name,
      notebook_id: notebook_id
    }));
  }, [sendMessage]);

  const posthogSetup = useCallback((userId: string, apiKey: string, baseUrl: string) => {
    sendMessage(JSON.stringify({
      type: 'posthog_setup',
      user_id: userId,
      api_key: apiKey,
      base_url: baseUrl,
    }));
  }, [sendMessage]);

  return {
    executeCode,
    saveNotebook,
    loadNotebook,
    restartKernel,
    deployCode,
    posthogSetup,
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