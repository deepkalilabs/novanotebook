from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json
from jupyter_client import KernelManager
import os
from pydantic import BaseModel
import ssl
from pprint import pprint
app = FastAPI()

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

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to manage kernels per session
sessions = {}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    print(f"New connection with session ID: {session_id}")
    
    await websocket.accept()
    
    print(f"New connection with session ID: {session_id}")

    if session_id not in sessions:
        # Start a new kernel for the session
        km = KernelManager()
        km.start_kernel()
        kc = km.client()
        kc.start_channels()
        sessions[session_id] = {'km': km, 'kc': kc}
    else:
        kc = sessions[session_id]['kc']

    try:
        while True:
            data = await websocket.receive_json()
            
            print(f"Received data: {data}\n\n")
            if data['type'] == 'execute':
                code = data['code']
                output = await execute_code(kc, code)

                print(f"Sending output: {output}, type: {type(output)}, cellId: {data['cellId']}\n\n")
                msgOutput = OutputExecutionMessage(type='output', cellId=data['cellId'], output=output)
                await websocket.send_json(msgOutput.model_dump())
            
            elif data['type'] == 'save_notebook':
                response = await save_notebook(data)
                print("response", response)
                response = OutputSaveMessage(type='notebook_saved', success=response['success'], message=response['message'])
                await websocket.send_json(response.model_dump())
                
            elif data['type'] == 'load_notebook':
                response = await load_notebook(data['filename'])
                response = OutputLoadMessage(type='notebook_loaded', success=response['status'] == 'success', message=response['message'], cells=response['notebook'])
                await websocket.send_json(response.model_dump())
                
            msgOutput = ''
            
    except WebSocketDisconnect:
        pass
    finally:
        # Optionally, you can decide when to shut down the kernel
        pass
    
async def execute_code(kernel_client, code: str) -> str:
    kernel_client.execute(code)
    output = ""
    while True:
        print("waiting for message")
        try:
            msg = kernel_client.get_iopub_msg(timeout=1)
            msg_type = msg['header']['msg_type']
            content = msg['content']
            if msg_type == 'status' and content['execution_state'] == 'busy':
                continue
            if msg_type == 'stream':
                print("stream", content)
                output += content['text']
            elif msg_type == 'execute_result':
                print("execute_result", content)
                output += content['data']['text/plain']
            elif msg_type == 'error':
                print("error", content)
                output += '\n'.join(content['traceback'])
            elif msg_type == 'status' and content['execution_state'] == 'idle':
                # Execution finished
                if output:
                    break
            print(f"content: {content} \n\n")
        except Exception as e:
            if str(e).strip():
                print(f"error: {e} \n\n")
                break
            continue
    return output

async def save_notebook(data: dict):
    try:
        notebook = data.get('cells')
        filename = data.get('filename')
        print("notebook", notebook)
        if not notebook:
            return {"success": False, "message": "No cells found in the file provided."}
        
        filepath = os.path.join('notebooks', filename)
        with open(filepath, 'w') as f:
            json.dump(notebook, f)
        print(f"Saved notebook to {filepath}")
        return {"success": True, "message": "Notebook saved successfully."}
    except Exception as e:
        return {"success": False, "message": str(e)}

async def load_notebook(filename: str):
    filepath = os.path.join('notebooks', filename)
    if not os.path.exists(filepath):
        return {"status": "error", "message": "Notebook not found.", "notebook": []}
    with open(filepath, 'r') as f:
        notebook = json.load(f)
    if not notebook:
        return {"status": "error", "message": "Notebook is empty.", "notebook": []}
    return {"status": "success", "notebook": notebook, "message": "Notebook loaded successfully."}

# Endpoint for "one-click deploy" functionality
@app.post("/deploy")
async def deploy_app(data: dict):
    # Implement your deployment logic here
    # For example, you can package the notebook and deploy it to a server or cloud service
    return {"status": "success", "message": "Application deployed successfully."}

if __name__ == "__main__":
    if not os.path.exists('notebooks'):
        os.makedirs('notebooks')

    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True
    )
    

