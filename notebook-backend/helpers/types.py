from pydantic import BaseModel

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
    request_id: str
    input_params: dict | None
    completed: bool | None
    result: dict | None
    created_at: str | None
    updated_at: str | None
    completed_at: str | None
    error: str | None
    
class SupabaseJobList(BaseModel):
    jobs: list[SupabaseJobDetails]
