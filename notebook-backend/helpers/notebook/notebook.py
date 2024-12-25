import os
import json
import sh
import sys
from io import StringIO
from jupyter_client.kernelspec import KernelSpecManager
from jupyter_client import KernelManager
from helpers.aws.s3 import s3
from pathlib import Path
from typing import Tuple
from helpers.notebook.magic_command import MagicCommandHandler
from helpers.supabase.client import get_supabase_client

class NotebookUtils():
    def __init__(self, notebook_id: str):
        self.notebook_id = notebook_id
        self.env_name = f"venv_kernel_{notebook_id}"
        self.magic_command_handler = None
        self.kernel_client = None
        self.kernel_manager = None
    
    @property
    def relevant_env_path(self):
        curr_envs = {os.path.basename(env): env for env in json.loads(sh.conda("env", "list", "--json"))['envs']}
        relevant_env_path = curr_envs.get(self.env_name, None)
        return relevant_env_path
        
    def initialize_relevant_env_path(self):
        # TODO: Block cell execution if env is not initialized.
        if not self.relevant_env_path:
            sh.conda(
                "create", "-n", self.env_name, "python=3.9", "ipykernel",
                _out=sys.stdout, _err=sys.stderr, force=True
            )
            
            relevant_env_path_python = os.path.join(self.relevant_env_path, "bin", "python3")
                
            try:
                sh.Command(relevant_env_path_python)(
                    "-m", "ipykernel", "install", 
                    "--user", "--name", self.env_name, "--display-name", self.env_name,
                    _out=sys.stdout, _err=sys.stderr)
                
            except sh.ErrorReturnCode as e:
                print(f"Error installing kernel: {e}")
        
        return self.relevant_env_path
    
    def initialize_kernel(self):
        self.initialize_relevant_env_path()

        ksm = KernelSpecManager()
        
        if self.env_name not in ksm.find_kernel_specs():
            raise ValueError(f"Kernel '{self.env_name}' not found.")
        
        self.kernel_manager = KernelManager(kernel_name=self.env_name)
        self.kernel_manager.start_kernel()
        self.kernel_client = self.kernel_manager.client()
        self.kernel_client.start_channels()
        return self.kernel_manager, self.kernel_client
    
    async def execute_code(self, code: str) -> str:
        try:
            if code.strip().startswith('!'):
                self.magic_command_handler = MagicCommandHandler(self.relevant_env_path)
                return self.magic_command_handler.execute(code)
        except Exception as e:  
            return "Error in the magic command: " + str(e)
            
        self.kernel_client.execute(code)
        output = ""
        count = 0
        while True:
            print("waiting for message")
            try:
                msg = self.kernel_client.get_iopub_msg(timeout=1)
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

    async def save_notebook(self, data: dict):
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
            
            response = s3.save_or_update_notebook(notebook_id, user_id, notebook)
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


    async def load_notebook_handler(self, filename: str, notebook_id: str, user_id: str):
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
            
            response = s3.load_notebook(file_path)
            print("loaded_notebook", len(response))
    
            if response.get('statusCode') != 200:
                return {"status": "error", "message": "Notebook not found in S3.", "notebook": []}
            
            notebook = json.loads(response.get('response'))
            return {"status": "success", "notebook": notebook, "message": "Notebook loaded succesfully."}
        except Exception as e:
            return {"status": "error", "message": str(e), "notebook": []}
            
    async def get_notebook_details(self):
        supabase = get_supabase_client()
        response = supabase.table('notebooks').select('*').eq('id', self.notebook_id).single().execute()
        print("response", response)
        return response.data
