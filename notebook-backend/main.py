import string
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import json
from jupyter_client import KernelManager
import os
from pydantic import BaseModel
import ssl
from pprint import pprint
from lambda_generator.generate_lambda_fn import LambdaGenerator
import sh
from jupyter_client.kernelspec import KernelSpecManager
import sys
from io import StringIO
from helpers.supabase.job_status import get_all_jobs_for_user, get_job_by_request_id, get_all_jobs_for_notebook
from helpers.supabase.notebooks import get_notebook_by_id
from helpers.aws.s3.s3 import save_or_update_notebook, load_notebook
from helpers.types import OutputExecutionMessage, OutputSaveMessage, OutputLoadMessage, OutputGenerateLambdaMessage, OutputPosthogSetupMessage
from uuid import UUID
from connectors.helpers.aws.s3.helpers import S3Helper
from connectors.services.posthog.posthog_service import PostHogService
import logging

logging.basicConfig(level=logging.INFO)
app = FastAPI()

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
    
    def get_relevant_env_path(env_name: str):
        curr_envs = {os.path.basename(env): env for env in json.loads(sh.conda("env", "list", "--json"))['envs']}
        relevant_env_path = curr_envs.get(env_name, None)
        return relevant_env_path
    
    print(f"New connection with session ID: {session_id}")
    
    await websocket.accept()
    
    print(f"New connection with session ID: {session_id}")

    if session_id not in sessions:
        # Start a new kernel for the session
        user_id = 4
        env_name = f"venv_kernel_{user_id}"
        relevant_env_path = get_relevant_env_path(env_name)

        print(f"relevant_env_path: {relevant_env_path}")
        if not relevant_env_path:
            sh.conda(
                "create", "-n", env_name, "python=3.9", "ipykernel",
                _out=sys.stdout, _err=sys.stderr, force=True
            )
            relevant_env_path = get_relevant_env_path(env_name)
            
        relevant_env_path_python = os.path.join(relevant_env_path, "bin", "python3")
        print(f"relevant_env_path_python: {relevant_env_path_python}")
        
        try:
            sh.Command(relevant_env_path_python)(
                "-m", "ipykernel", "install", 
                "--user", "--name", env_name, "--display-name", env_name,
                _out=sys.stdout, _err=sys.stderr)
            
        except sh.ErrorReturnCode as e:
            print(f"Error installing kernel: {e}")
        
        ksm = KernelSpecManager()
        
        if env_name not in ksm.find_kernel_specs():
            raise ValueError(f"Kernel '{env_name}' not found.")
        
        km = KernelManager(kernel_name=env_name)
        km.start_kernel()
        kc = km.client()
        kc.start_channels()
        sessions[session_id] = {'km': km, 'kc': kc}
    else:
        kc = sessions[session_id]['kc']

    try:
        while True:
            data = await websocket.receive_json()
            if data['type'] == 'execute':
                code = data['code']
                output = await execute_code(kernel_client=kc, relevant_env_path=relevant_env_path, code=code)

                print(f"Sending output: {output}, type: {type(output)}, cellId: {data['cellId']}\n\n")
                msgOutput = OutputExecutionMessage(type='output', cellId=data['cellId'], output=output)
                await websocket.send_json(msgOutput.model_dump())
            
            elif data['type'] == 'save_notebook':
                response = await save_notebook(data)
                # print("response", response)
                response = OutputSaveMessage(type='notebook_saved', success=response['success'], message=response['message'])
                await websocket.send_json(response.model_dump())
                
            elif data['type'] == 'load_notebook':
                response = await load_notebook_handler(data['filename'], data['notebook_id'], data['user_id'])
                # print("response", response)
                output = OutputLoadMessage(type='notebook_loaded', success=response['status'] == 'success', message=response['message'], cells=response['notebook'])
                await websocket.send_json(output.model_dump())

            elif data['type'] == 'posthog_setup':
                logging.info("Setting up PostHog...")
                logging.info("Task 1: Save the credentials to S3")
                logging.info("Task 2: Setup PostHog in the notebook")
                user_id = data.get('user_id')
                api_key = data.get('api_key')
                base_url = data.get('base_url')

                logging.info(f"data: {data}")
                logging.info(f"user_id: {user_id}, api_key: {api_key}, base_url: {base_url}")

                aws_credentials = {
                    "aws_access_key_id": os.environ.get('AWS_ACCESS_KEY_ID'),
                    "aws_secret_access_key": os.environ.get('AWS_SECRET_ACCESS_KEY'),
                    "region_name": os.environ.get('AWS_DEFAULT_REGION')
                }

                # Format the credentials in the new structure
                posthog_credentials = {
                    "posthog": {
                        "credentials": {
                            "api_key": api_key,
                            "base_url": base_url
                        }
                    }
                }
                print(f"posthog_credentials: {posthog_credentials['posthog']['credentials']}")

                logging.info("Task 1: Saving credentials to S3")
                # Initialize S3Helper
                s3_helper = S3Helper(credentials=aws_credentials)
                await s3_helper.init_s3(user_id)  # This initializes the S3 client

                # Now save the credentials
                response = s3_helper.save_or_update_credentials(user_id, posthog_credentials)
                logging.info(f"response: {response}")

                if response['ResponseMetadata']['HTTPStatusCode'] != 200:
                    raise ValueError("Failed to save credentials")
                
                #Task 2: Setup PostHog in the notebook
                # Setup PostHog in the notebook
                posthog_setup_code = f"""
                from connectors.services.posthog.posthog_service import PostHogService
                from IPython import get_ipython

                # Initialize PostHog service
                posthog_service = PostHogService({posthog_credentials['posthog']['credentials']})


                # Get IPython instance and inject into namespace
                ipython = get_ipython()
                ipython.user_ns['posthog_service'] = posthog_service
                ipython.user_ns['posthog_client'] = posthog_service.client
                ipython.user_ns['posthog_adapter'] = posthog_service.adapter
                """
                logging.info(f"Injecting PostHog setup code into the notebook: {posthog_setup_code}")
                output = await execute_code(kernel_client=kc, relevant_env_path=relevant_env_path, code=posthog_setup_code)
                logging.info(f"output: {output}")

                response = OutputPosthogSetupMessage(type='posthog_setup', success=True, message="PostHog setup complete")
                await websocket.send_json(response.model_dump())
                
            elif data['type'] == 'deploy_lambda':
                # TODO: Better dependency management here.
                # TODO: Get status/msg directly from function.
                # TODO: Make a base lambda layer for basic dependencies.
                dependencies = await execute_code(kernel_client=kc, relevant_env_path=relevant_env_path, code='!pip list --format=freeze')
                lambda_handler = LambdaGenerator(data['allCode'], 1, data['notebookName'], dependencies)
                status = False

                msg = "Processing the notebook"
                response = OutputGenerateLambdaMessage(type='lambda_generated', success=status, message=msg)
                await websocket.send_json(response.model_dump())
                lambda_handler.save_lambda_code()

                msg = "Preparing your code for prod"
                lambda_handler.prepare_container()
                response = OutputGenerateLambdaMessage(type='lambda_generated', success=status, message=msg)
                await websocket.send_json(response.model_dump())
                
                msg = "Shipping your code to the cloud"
                lambda_handler.build_and_push_container()
                response = OutputGenerateLambdaMessage(type='lambda_generated', success=status, message=msg)
                await websocket.send_json(response.model_dump())
                
                # msg = "Setting up your code to handle requests"
                response = lambda_handler.create_lambda_fn()
                # response = OutputGenerateLambdaMessage(type='lambda_generated', success=status, message=msg)
                # await websocket.send_json(response.model_dump())
                
                msg = "Creating an API for you"
                response = OutputGenerateLambdaMessage(type='lambda_generated', success=status, message=msg)
                await websocket.send_json(response.model_dump())
                
                status, message = lambda_handler.create_api_endpoint()
                response = OutputGenerateLambdaMessage(type='lambda_generated', success=status, message=message)
                # sleep(3) # Wait for API to be registered at AWS
                await websocket.send_json(response.model_dump())
                
            msgOutput = ''
            
    except WebSocketDisconnect:
        pass
    finally:
        # Optionally, you can decide when to shut down the kernel
        pass
    
async def execute_code(kernel_client, relevant_env_path: str, code: str) -> str:
    try:
        if code.strip().startswith('!'):
            magic_command = code.split(" ")[0][1:]
            base_magic_command = code.split(" ")[1:]
            
            output_buffer = StringIO()
            error_buffer = StringIO()
            
            result = sh.Command(os.path.join(relevant_env_path, "bin", magic_command))(
                *base_magic_command,
                _out=output_buffer, _err=error_buffer
            )
            print(f"magic_command: {magic_command}")
            print(f"base_magic_command: {base_magic_command}")
            print(f"relevant_env_path: {relevant_env_path}")
            print(f"output_buffer: {output_buffer.getvalue()}")
            print(f"error_buffer: {error_buffer.getvalue()}")
            print(f"result: {result}")
            return output_buffer.getvalue()
        
    except Exception as e:
        return "Error in the magic command: " + str(e)
        
    kernel_client.execute(code)
    output = ""
    count = 0
    while True:
        print("waiting for message")
        try:
            msg = kernel_client.get_iopub_msg(timeout=1)
            msg_type = msg['header']['msg_type']
            content = msg['content']
            if msg_type == 'status' and content['execution_state'] == 'busy':
                print("execution busy")
                count += 1
                if count > 5:
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
                output += '# Execution finished\n'
                break
            print(f"content: {content} \n\n")
        except Exception as e:
            if str(e).strip():
                print(f"error: {e} \n\n")
                count += 1
                if count > 10:
                    break
            continue
    return output

async def save_notebook(data: dict):
    try:
        notebook = data.get('cells')
        filename = data.get('filename')
        user_id = data.get('user_id')
        notebook_id = data.get('notebook_id')

        if not notebook_id:
            return {"success": False, "message": "Notebook ID is required."}
        
        if not user_id:
            return {"success": False, "message": "User ID is required."}

        if not notebook:
            return {"success": False, "message": "No cells found in the file provided."}
        

        response = save_or_update_notebook(notebook_id, user_id, notebook)
        # print("response", response)   
        
        # TODO: Save to s3 instead of local file system.
        """"
        filepath = os.path.join('notebooks', filename)
        with open(filepath, 'w') as f:
            json.dump(notebook, f)
        print(f"Saved notebook to {filepath}")
        """
        return {"success": True, "message": "Notebook saved successfully."}
    except Exception as e:
        return {"success": False, "message": str(e)}

async def load_notebook_handler(filename: str, notebook_id: str, user_id: str):
    """
    Load a notebook from S3
    Returns (success, content or error message)
    """
   
    if not notebook_id:
        return {"status": "error", "message": "Notebook ID is required.", "notebook": []}
    
    if not user_id:
        return {"status": "error", "message": "User ID is required.", "notebook": []}
    
    
    try:
        file_path = f"notebooks/{user_id}/{notebook_id}.json"
        print(f"Attempting to load notebook from S3: {file_path}")  # Debug log
        
        response = load_notebook(file_path)
        print("loaded_notebook", len(response))
 
        
        if response.get('statusCode') != 200:
            return {"status": "error", "message": "Notebook not found in S3.", "notebook": []}
        
        notebook = json.loads(response.get('response'))
        return {"status": "success", "notebook": notebook, "message": "Notebook loaded succesfully."}
    except Exception as e:
        return {"status": "error", "message": str(e), "notebook": []}
        

@app.get("/status/jobs/{user_id}")
async def status_endpoint(user_id: UUID):
    # TODO: Check if user has access to this data.
    return get_all_jobs_for_user(str(user_id))

@app.get("/status/jobs/{user_id}/{request_id}")
async def status_endpoint(user_id: int, request_id: str):
    return get_job_by_request_id(request_id, user_id)

@app.get("/status/notebook/jobs/{notebook_id}")
async def status_endpoint(notebook_id: UUID):
    return get_all_jobs_for_notebook(notebook_id)

 
if __name__ == "__main__":
    if not os.path.exists('notebooks'):
        os.makedirs('notebooks')

    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        reload_excludes=[
            "lambda_dumps/**",
            "**/lambda_dumps/**",
            "**/lambda_function.py",              # Exclude any lambda_function.py
            "**/requirements.txt"                 # Exclude any requirements.txt
        ],
        log_level="info",
        access_log=True
    )


