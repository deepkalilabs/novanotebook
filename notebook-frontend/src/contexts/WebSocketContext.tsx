import React, { createContext, useContext, useRef } from 'react';
import { useWebSocket } from 'react-use-websocket';

const WebSocketContext = createContext<any>(null);

export function WebSocketProvider({ children, sessionId, notebookId }) {
  const socketUrl = `ws://0.0.0.0:8000/ws/${sessionId}/${notebookId}`;
  const wsInstance = useWebSocket(socketUrl, {
    share: true,
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  return (
    <WebSocketContext.Provider value={wsInstance}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocketContext = () => useContext(WebSocketContext); 