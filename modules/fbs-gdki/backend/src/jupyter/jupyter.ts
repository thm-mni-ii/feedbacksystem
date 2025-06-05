import WebSocket from 'ws';

interface ExecutionResult {
  status: 'ok' | 'error' | 'abort';
  results: any[];
  execution_count?: number;
  error?: {
    name: string;
    message: string;
    traceback: string[];
  };
}

class JupyterKernelClient {
  private kernelId: string | null = null;
  private baseUrl: string;
  private sessionId: string;

  constructor(baseUrl: string = 'http://jupyter-kernel-gateway:8888') {
    this.baseUrl = baseUrl;
    this.sessionId = this.generateId('session');
  }

  async startKernel(kernelName: string = 'python3'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/kernels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'localhost:8888', 
      },
      body: JSON.stringify({
        name: kernelName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start kernel: ${response.statusText}`);
    }

    const kernel = await response.json();
    this.kernelId = kernel.id;
    return kernel.id;
  }

  async executeCode(code: string, timeout: number = 30000): Promise<ExecutionResult> {
    if (!this.kernelId) {
      throw new Error('No kernel started. Call startKernel() first.');
    }

    return new Promise((resolve, reject) => {
      // Use ws:// for WebSocket, not http://
      const wsUrl = this.baseUrl.replace('http://', 'ws://') + `/api/kernels/${this.kernelId}/channels`;
      const ws = new WebSocket(wsUrl);

      const msgId = this.generateId('msg');
      const executionResults: any[] = [];
      let executionCount: number | undefined;
      let timeoutId: NodeJS.Timeout;

      // Set up timeout
      timeoutId = setTimeout(() => {
        ws.close();
        reject(new Error(`Code execution timed out after ${timeout}ms`));
      }, timeout);

      ws.on('open', () => {
        console.log('WebSocket connected');
        
        const message = {
          header: {
            msg_id: msgId,
            msg_type: 'execute_request',
            username: 'user',
            session: this.sessionId,
            date: new Date().toISOString(),
            version: '5.3'
          },
          parent_header: {},
          metadata: {},
          content: {
            code: code,
            silent: false,
            store_history: true,
            user_expressions: {},
            allow_stdin: false,
            stop_on_error: true
          },
          channel: 'shell'
        };

        ws.send(JSON.stringify(message));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Only process messages related to our execution
          if (message.parent_header?.msg_id !== msgId) {
            return;
          }

          console.log('Received message type:', message.msg_type);

          switch (message.msg_type) {
            case 'stream':
              // stdout/stderr output
              executionResults.push({
                type: 'stream',
                name: message.content.name, // 'stdout' or 'stderr'
                text: message.content.text
              });
              break;

            case 'execute_result':
              // Return values from expressions
              executionResults.push({
                type: 'execute_result',
                data: message.content.data,
                metadata: message.content.metadata
              });
              break;

            case 'display_data':
              // Rich display content
              executionResults.push({
                type: 'display_data',
                data: message.content.data,
                metadata: message.content.metadata
              });
              break;

            case 'error':
              // Execution errors
              clearTimeout(timeoutId);
              ws.close();
              resolve({
                status: 'error',
                results: executionResults,
                error: {
                  name: message.content.ename,
                  message: message.content.evalue,
                  traceback: message.content.traceback
                }
              });
              return;

            case 'execute_reply':
              // Execution finished
              clearTimeout(timeoutId);
              ws.close();
              
              executionCount = message.content.execution_count;
              const status = message.content.status;
              
              resolve({
                status: status,
                results: executionResults,
                execution_count: executionCount,
                ...(status === 'error' && {
                  error: {
                    name: message.content.ename || 'Unknown',
                    message: message.content.evalue || 'Unknown error',
                    traceback: message.content.traceback || []
                  }
                })
              });
              return;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('error', (error) => {
        clearTimeout(timeoutId);
        console.error('WebSocket error:', error);
        reject(error);
      });

      ws.on('close', (code, reason) => {
        clearTimeout(timeoutId);
        console.log('WebSocket closed:', code, reason.toString());
      });
    });
  }

  async stopKernel(): Promise<void> {
    if (!this.kernelId) {
      return;
    }

    const response = await fetch(`${this.baseUrl}/api/kernels/${this.kernelId}`, {
      method: 'DELETE',
      headers: {
        'Host': 'localhost:8888',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to stop kernel: ${response.statusText}`);
    }

    this.kernelId = null;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage example
async function example() {
  const client = new JupyterKernelClient();

  try {
    // Start kernel
    console.log('Starting kernel...');
    const kernelId = await client.startKernel('python3');
    console.log('Kernel started:', kernelId);

    // Execute Python code
    console.log('Executing code...');
    const result = await client.executeCode(`
import pandas as pd
import numpy as np

# Create some data
data = {'A': [1, 2, 3], 'B': [4, 5, 6]}
df = pd.DataFrame(data)
print("DataFrame:")
print(df)
print("\\nSum of column A:", df['A'].sum())

# Return a value
df.describe()
    `);

    console.log('Execution completed!');
    console.log('Status:', result.status);
    console.log('Results:');
    
    result.results.forEach((output, index) => {
      console.log(`\n--- Output ${index + 1} (${output.type}) ---`);
      if (output.type === 'stream') {
        console.log(output.text);
      } else if (output.type === 'execute_result' || output.type === 'display_data') {
        console.log(output.data);
      }
    });

    if (result.error) {
      console.error('Error:', result.error);
    }

    // Clean up
    await client.stopKernel();
    console.log('Kernel stopped');

  } catch (error) {
    console.error('Error:', error);
  }
}

export { JupyterKernelClient, ExecutionResult };
export default JupyterKernelClient;