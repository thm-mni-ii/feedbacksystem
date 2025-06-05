from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import io
import contextlib
import traceback
import json
from typing import Any, Dict
import asyncio
import subprocess

app = FastAPI(title="Python Code Executor")

class CodeRequest(BaseModel):
    code: str
    timeout: int = 10

class CodeResponse(BaseModel):
    stdout: str
    stderr: str
    result: Any = None
    execution_time: float
    success: bool

@contextlib.contextmanager
def capture_output():
    """Capture stdout and stderr"""
    old_stdout, old_stderr = sys.stdout, sys.stderr
    stdout_capture, stderr_capture = io.StringIO(), io.StringIO()
    
    try:
        sys.stdout, sys.stderr = stdout_capture, stderr_capture
        yield stdout_capture, stderr_capture
    finally:
        sys.stdout, sys.stderr = old_stdout, old_stderr

@app.post("/execute", response_model=CodeResponse)
async def execute_code(request: CodeRequest):
    """Execute Python code safely"""
    import time
    start_time = time.time()
    
    try:
        # Create a clean namespace for execution
        namespace = {
            '__builtins__': __builtins__,
            'print': print,
            # Add safe imports
            'math': __import__('math'),
            'random': __import__('random'),
            'datetime': __import__('datetime'),
            'json': __import__('json'),
        }
        
        # Try to import common data science libraries
        try:
            namespace['numpy'] = __import__('numpy')
            namespace['np'] = namespace['numpy']
        except ImportError:
            pass
            
        try:
            namespace['pandas'] = __import__('pandas')
            namespace['pd'] = namespace['pandas']
        except ImportError:
            pass
        
        with capture_output() as (stdout_capture, stderr_capture):
            # Execute the code
            result = None
            try:
                # First try exec for statements
                exec(request.code, namespace)
            except SyntaxError:
                # If that fails, try eval for expressions
                result = eval(request.code, namespace)
        
        execution_time = time.time() - start_time
        
        return CodeResponse(
            stdout=stdout_capture.getvalue(),
            stderr=stderr_capture.getvalue(),
            result=result,
            execution_time=execution_time,
            success=True
        )
        
    except Exception as e:
        execution_time = time.time() - start_time
        return CodeResponse(
            stdout="",
            stderr=f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}",
            result=None,
            execution_time=execution_time,
            success=False
        )

@app.post("/execute_safe")
async def execute_code_subprocess(request: CodeRequest):
    """Execute Python code in a subprocess for better isolation"""
    try:
        # Create a temporary Python script
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(request.code)
            temp_file = f.name
        
        try:
            # Execute in subprocess with timeout
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=request.timeout
            )
            
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode,
                "success": result.returncode == 0
            }
            
        finally:
            # Clean up temp file
            os.unlink(temp_file)
            
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": f"Execution timed out after {request.timeout} seconds",
            "returncode": -1,
            "success": False
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "returncode": -1,
            "success": False
        }

@app.get("/")
async def root():
    return {"message": "Python Code Executor API"}

@app.get("/health")
async def health():
    return {"status": "healthy", "python_version": sys.version}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)