from pydantic import BaseModel
from typing import Optional

class OutputExecutionMessage(BaseModel):
    type: str
    cellId: str
    output: str

class OutputSaveMessage(BaseModel):
    type: str
    success: bool
    message: str

class OutputLoadMessage(BaseModel):
    type: str
    success: bool
    message: str
    cells: list
    
class OutputGenerateLambdaMessage(BaseModel):
    type: str
    success: bool
    message: str

class SupabaseJobDetails(BaseModel):
    request_id: Optional[str] = None
    input_params: Optional[dict] = None
    completed: Optional[bool] = False
    result: Optional[dict] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None
    notebook_id: Optional[str] = None
    
class SupabaseJobList(BaseModel):
    jobs: list[SupabaseJobDetails]

class OutputPosthogSetupMessage(BaseModel):
    type: str
    success: bool
    message: str

class ScheduledJob(BaseModel):
    id: str
    schedule: str
    last_run: Optional[str] = None
    next_run: Optional[str] = None
    submit_endpoint: Optional[str] = None
    input_params: Optional[str] = None

class NotebookDetails(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    user_id: str
    s3_url: Optional[str] = None
    submit_endpoint: Optional[str] = None
    cells: Optional[list] = None
    session_id: Optional[str] = None
    created_at: Optional[str] = None 
    updated_at: Optional[str] = None