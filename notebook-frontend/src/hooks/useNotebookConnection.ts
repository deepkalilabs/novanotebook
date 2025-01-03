// hooks/useNotebookConnection.ts
'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidv4 } from 'uuid';

import { NotebookCell, OutputDeployMessage, NotebookConnectionProps } from '@/app/types';
import { OutputExecutionMessage, OutputSaveMessage, OutputLoadMessage, OutputConnectorCreatedMessage } from '@/app/types';
import { useToast } from '@/hooks/use-toast';
//import { useWebSocketContext } from '@/contexts/WebSocketContext'; May need this later for avoiding multiple connections and reusing the same connection

export function useNotebookConnection({
  onOutput,
  onNotebookLoaded,
  onNotebookSaved,
  onNotebookDeployed,
  onError,
  notebookDetails,
  onConnectorStatus,
  onConnectorCreated,
}: NotebookConnectionProps) {
  const { toast } = useToast();
  //const { connectors, setConnectors } = useConnectorsStore();
  const sessionId = useRef(uuidv4()).current;
  const notebookId = notebookDetails?.notebookId
  console.log("details", notebookId)
  const [isReconnecting, setIsReconnecting] = useState(false);

  const socketUrl = useMemo(() => {
    const socketBaseURL = process.env.NODE_ENV === 'development' ? '0.0.0.0' : process.env.NEXT_PUBLIC_AWS_EC2_IP;
    return `ws://${socketBaseURL}:8000/ws/${sessionId}/${notebookId}`;
  }, [sessionId, notebookId]);

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl, {
    onOpen: () => {
      setIsReconnecting(false);
      toast({
        title: "Connected to Python kernel",
        description: "Successfully connected to Python kernel"
      });
    },
    onClose: () => {
      if (!isReconnecting) {
        toast({
          title: "Disconnected from Python kernel",
          description: "Attempting to reconnect..."
        });
      }
    },
    onError: (event) => {
      console.error("WebSocket error:", event);
      onError?.("Failed to connect to Python kernel");
    },
    shouldReconnect: (closeEvent) => {
      setIsReconnecting(true);
      return true;
    },
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    share: true,
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
        case 'connector_status':
          console.log("Received connector_status")
          onConnectorStatus?.({success: data.success, message: data.message});
          break;
        case 'connector_created':
          console.log("Received connector_created")
          parsedData = data as OutputConnectorCreatedMessage;
          console.log("Received connector_created in useNotebookConnection", parsedData)
          onConnectorCreated?.(parsedData);
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


  const createConnector = useCallback((connectorType: string, credentials: any, userId: string, notebookId: string) => {
    sendMessage(JSON.stringify({
      type: 'create_connector',
      connector_type: connectorType,
      credentials: credentials,
      user_id: userId,
      notebook_id: notebookId
    }));
  }, [sendMessage]);

  return {
    executeCode,
    saveNotebook,
    loadNotebook,
    restartKernel,
    deployCode,
    createConnector,
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