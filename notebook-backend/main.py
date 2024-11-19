from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json
from jupyter_client import KernelManager
import os
from pydantic import BaseModel

app = FastAPI()

class OutputMessage(BaseModel):
    type: str
    cellId: str
    output: str

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
            
            print(f"Received data: {data}")
            if data['type'] == 'execute':
                code = data['code']
                kc.execute(code)
                output = ""
                while True:
                    try:
                        msg = kc.get_iopub_msg(timeout=1)
                        msg_type = msg['header']['msg_type']
                        content = msg['content']
                        if msg_type == 'stream':
                            output += content['text']
                        elif msg_type == 'execute_result':
                            output += content['data']['text/plain']
                        elif msg_type == 'error':
                            output += '\n'.join(content['traceback'])
                        elif msg_type == 'status' and content['execution_state'] == 'idle':
                            # Execution finished
                            break
                    except Exception:
                        break
                print(f"Sending output: {output}, type: {type(output)}, cellId: {data['cellId']}")
                msgOutput = OutputMessage(type='output', cellId=data['cellId'], output=output)
                await websocket.send_json(msgOutput.model_dump(mode='json'))
    except WebSocketDisconnect:
        pass
    finally:
        # Optionally, you can decide when to shut down the kernel
        pass

# Endpoint to save the notebook
@app.post("/save")
async def save_notebook(data: dict):
    filename = data.get('filename', 'untitled.ipynb')
    notebook = data.get('notebook')
    if not notebook:
        return {"status": "error", "message": "No notebook data provided."}
    filepath = os.path.join('notebooks', filename)
    with open(filepath, 'w') as f:
        json.dump(notebook, f)
    return {"status": "success"}

# Endpoint to load the notebook
@app.get("/load")
async def load_notebook(filename: str):
    filepath = os.path.join('notebooks', filename)
    if not os.path.exists(filepath):
        return {"status": "error", "message": "Notebook not found."}
    with open(filepath, 'r') as f:
        notebook = json.load(f)
    return {"status": "success", "notebook": notebook}

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
    uvicorn.run(app, host="0.0.0.0", port=8000)

