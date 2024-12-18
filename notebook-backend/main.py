from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
from helpers.lambda_generator import lambda_generator
from helpers.supabase import job_status
from helpers.types import OutputExecutionMessage, OutputSaveMessage, OutputLoadMessage, OutputGenerateLambdaMessage, OutputPosthogSetupMessage
from uuid import UUID
from helpers.notebook import notebook
from helpers.aws.s3.s3 import S3Helper
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
notebook_sessions = {}

@app.websocket("/ws/{session_id}/{notebook_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, notebook_id: str):

    print(f"New connection with session ID: {session_id} and notebook ID: {notebook_id}")
    
    await websocket.accept()
    
    print(f"New connection with session ID: {session_id} and notebook ID: {notebook_id}")

    nb = notebook.NotebookUtils(notebook_id)


    if notebook_id not in notebook_sessions:
        relevant_env_path = nb.initialize_relevant_env_path()
    
    kernel_manager, kernel_client = nb.initialize_kernel()
    notebook_sessions[notebook_id] = {'km': kernel_manager, 'kc': kernel_client}

    try:
        while True:
            data = await websocket.receive_json()
            if data['type'] == 'execute':
                code = data['code']
                output = await nb.execute_code(code=code)

                print(f"Sending output: {output}, type: {type(output)}, cellId: {data['cellId']}\n\n")
                msgOutput = OutputExecutionMessage(type='output', cellId=data['cellId'], output=output)
                await websocket.send_json(msgOutput.model_dump())
            
            elif data['type'] == 'save_notebook':
                response = await nb.save_notebook(data)
                # print("response", response)
                response = OutputSaveMessage(type='notebook_saved', success=response['success'], message=response['message'])
                await websocket.send_json(response.model_dump())
                
            elif data['type'] == 'load_notebook':
                response = await nb.load_notebook_handler(data['filename'], data['notebook_id'], data['user_id'])
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
                output = await nb.execute_code(code=posthog_setup_code)
                logging.info(f"output: {output}")

                response = OutputPosthogSetupMessage(type='posthog_setup', success=True, message="PostHog setup complete")
                await websocket.send_json(response.model_dump())
                
            elif data['type'] == 'deploy_lambda':
                # TODO: Better dependency management here.
                # TODO: Get status/msg directly from function.
                # TODO: Make a base lambda layer for basic dependencies.
                dependencies = await nb.execute_code(code='!pip list --format=freeze')
                lambda_handler = lambda_generator.LambdaGenerator(data['all_code'], data['user_id'], data['notebook_name'], data['notebook_id'], dependencies)
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
                response = lambda_handler.create_lambda_fn()
                
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

@app.get("/status/jobs/{user_id}")
async def status_endpoint_jobs_for_user(user_id: UUID):
    # TODO: Check if user has access to this data.
    return job_status.get_all_jobs_for_user(str(user_id))

@app.get("/status/jobs/{user_id}/{request_id}")
async def status_endpoint_job_by_request_id(user_id: int, request_id: str):
    return job_status.get_job_by_request_id(request_id, user_id)

@app.get("/status/notebook/jobs/{notebook_id}")
async def status_endpoint_jobs_for_notebook(notebook_id: UUID): 
    return job_status.get_all_jobs_for_notebook(notebook_id)

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

