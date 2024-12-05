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

export interface OutputDeployMessage {
    type: string;
    success: boolean;
    message: string;
}

export interface Job {
    completed: boolean | null;
    completed_at: string | null;
    created_at: string;
    error: string | null;
    input_params: unknown | null;
    notebook_id: string;
    request_id: string;
    result: unknown | null;
    updated_at: string;
}

export interface Jobs {
  jobs: Job[];
}

export interface FileUploadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileSelect: (fileName: string, content: { cells: any[] }) => void;
}
