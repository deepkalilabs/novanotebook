// app/types.ts
export type CellType = 'code' | 'markdown' | 'file';

export interface NotebookCell {
  id: string;
  code: string;
  output: string;
  executionCount: number;
  type: CellType;
}

export interface NotebookToolbarProps {
  name: string;
  onHandleAddCell: (type: CellType) => void;
  onHandleSave: (filename: string) => Promise<void>;
  onHandleLoad: (filename: string) => Promise<void>;
  onHandleRestartKernel?: () => Promise<void>;
  isConnected: boolean;
  allCells: NotebookCell[];
  onHandleDeploy?: () => Promise<void>;
  posthogSetup: (userId: string, apiKey: string, baseUrl: string) => void; //TODO: Abstract to add more connectors
}

export interface NotebookStore {
  cells: NotebookCell[];
  maxExecutionCount: number;
  addCell: (type: CellType) => void;
  updateCellCode: (id: string, code: string) => void;
  updateCellOutput: (id: string, output: string) => void;
  deleteCell: (id: string) => void;
  moveCellUp: (id: string) => void;
  moveCellDown: (id: string) => void;
  setCells: (cells: NotebookCell[]) => void;
}

export interface MarkdownEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  isMarkdownEditing: boolean;
}

export interface NotebookCellProps {
  id: string;
  code?: string;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  output: string;
  executionCount: number;
  isExecuting: boolean;
  type: CellType;
  onCodeChange: (code: string) => void;
  onExecute: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export interface NotebookDetails {
  notebookId: string
  userId: string
  name: string 
}

export interface NotebookConnectionProps {
  onOutput?: (cellId: string, output: string) => void;
  onNotebookLoaded?: (cells: NotebookCell[]) => void;
  onNotebookSaved?: (data: OutputSaveMessage) => void;
  onError?: (error: string) => void;
  onNotebookDeployed?: (data: OutputDeployMessage) => void;
  notebookDetails?: NotebookDetails;
  onPosthogSetup?: (data: OutputPosthogSetupMessage) => void;
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
    output: JSON;
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

export interface OutputPosthogSetupMessage {
    type: string;
    success: boolean;
    message: string;
    output: JSON;
}

export interface User {
    id: string;
    email: string;
}

export interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface NotebookPageProps {
  notebookId: string;
  userId: string;
  name: string;
}

export interface NotebookDetails {
  notebookId: string
  userId: string
  name: string 
}

export interface NotebookConnectionProps {
  onOutput?: (cellId: string, output: string) => void;
  onNotebookLoaded?: (cells: NotebookCell[]) => void;
  onNotebookSaved?: (data: OutputSaveMessage) => void;
  onError?: (error: string) => void;
  onNotebookDeployed?: (data: OutputDeployMessage) => void;
  notebookDetails?: NotebookDetails;
  onPosthogSetup?: (data: OutputPosthogSetupMessage) => void;
}

export interface Connector {
  type: string;
  success: boolean;
  message: string;
  output: JSON;
}

export interface ConnectorsStore {
  connectors: Connector[];
  setConnectors: (connectors: Connector[]) => void;
}

export interface ConnectorCredentials {
  id: string;
  connector_id: string;
  user_id: string;
  notebook_id: string;
  connector_type: string;
  credentials: JSON;
  has_seen_doc: boolean;
}

export interface ConnectorCredentialsList {
  credentials: ConnectorCredentials[];
}
