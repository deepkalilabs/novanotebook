import os
import json
import sh
from io import StringIO
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
