// app/types.ts
export interface NotebookCell {
  id: string;
  code: string;
  output: string;
  executionCount: number;
}

export interface WebSocketMessage {
  type: string;
  code?: string;
  cellId?: string;
  output?: string;
}

export interface SaveNotebookRequest {
  filename: string;
  notebook: {
    cells: NotebookCell[];
  };
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  notebook?: {
    cells: NotebookCell[];
  };
}

export interface OutputExecutionMessage {
    type: string;
    cellId: string;
    output: string;
}

export interface OutputSaveMessage {
    type: string;
    success: boolean;
    message: string;
}

export interface OutputLoadMessage {
    type: string;
    success: boolean;
    message: string;
    cells: NotebookCell[];
}