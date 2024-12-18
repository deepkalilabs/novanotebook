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

class MagicCommandHandler:
    """Handles magic commands using the sh library."""
    
    def __init__(self, env_path: str = None):
        self.env_path = env_path or str(Path.home())
        # Get pip path from env_path if provided, otherwise use default pip location
        self.pip_path = os.path.join(self.env_path, "bin", "pip") if env_path else "pip"
        
        self._commands = {
            'ls': self._ls,
            'cat': self._cat,
            'top': self._top,
            'pip': self._pip
        }
    
    def execute(self, code: str) -> Tuple[str, str]:
        """Execute a magic command and return (output, error)."""
        if not code.strip().startswith('!'):
            raise ValueError("Not a magic command")
        
        # Parse the command
        parts = code.strip()[1:].split(maxsplit=1)
        command = parts[0]
        args = parts[1].split() if len(parts) > 1 else []
        
        if command not in self._commands:
            return f"Command '{command}' not supported. Only ls, cat, top, and pip are available."
        
        try:
            output = self._commands[command](args)
            return output
        except Exception as e:
            return str(e)
    
    def _ls(self, args: list) -> str:
        """Execute ls command using sh."""
        output_buffer = StringIO()
        error_buffer = StringIO()
        
        try:
            # If no path specified, use current directory
            base_path = os.path.join('public', 'uploads')
            
            path = os.path.join(base_path, args[0]) if args else base_path
            
            # Handle ls flags
            flags = [arg for arg in args if arg.startswith('-')]
            
            sh.ls(path, *flags, _out=output_buffer, _err=error_buffer)
            
            disclaimer = """
                base path: `public/uploads`. Please use the full path to the file, e.g. `public/uploads/filename.csv` to perform pythonic file operations. \n\n
            """
            return disclaimer.lstrip() + output_buffer.getvalue().lstrip()
            
        except sh.ErrorReturnCode as e:
            raise Exception(f"ls command failed: {error_buffer.getvalue()}")
    
    def _cat(self, args: list) -> str:
        """Execute cat command using sh."""
        if not args:
            return "Error: No file specified"
            
        output_buffer = StringIO()
        error_buffer = StringIO()
        
        try:
            sh.cat(*args, _out=output_buffer, _err=error_buffer)
            return output_buffer.getvalue()
            
        except sh.ErrorReturnCode as e:
            raise Exception(f"cat command failed: {error_buffer.getvalue()}")
    
    def _top(self, args: list) -> str:
        """Execute top command using sh."""
        output_buffer = StringIO()
        error_buffer = StringIO()
        
        try:
            # Run top in batch mode (-b) and limit to one iteration (-n 1)
            sh.top('-b', '-n', '1', *args, _out=output_buffer, _err=error_buffer)
            return output_buffer.getvalue()
            
        except sh.ErrorReturnCode as e:
            raise Exception(f"top command failed: {error_buffer.getvalue()}")
            
    def _pip(self, args: list) -> str:
        """Execute pip command using sh."""
        output_buffer = StringIO()
        error_buffer = StringIO()
        
        try:
            # Get the pip command from the environment
            pip_cmd = sh.Command(self.pip_path)
            
            # Execute pip with provided arguments
            pip_cmd(
                *args,
                _out=output_buffer,
                _err=error_buffer
            )
            
            # Some pip commands write to stderr even on success
            output = output_buffer.getvalue()
            error = error_buffer.getvalue()
            
            return output if output else error
            
        except sh.ErrorReturnCode as e:
            # Pip often provides useful error messages in stderr
            error_msg = error_buffer.getvalue()
            if error_msg:
                raise Exception(f"pip command failed: {error_msg}")
            raise Exception(f"pip command failed with exit code {e.exit_code}")


class NotebookUtils():
    def __init__(self, notebook_id: str):
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
            
