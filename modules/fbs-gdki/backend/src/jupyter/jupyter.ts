interface KernelSpec {
  name: string;
  spec: {
    display_name: string;
    language: string;
  };
}

interface KernelInfo {
  id: string;
  name: string;
}

interface ExecuteRequest {
  code: string;
  silent?: boolean;
  store_history?: boolean;
  user_expressions?: Record<string, string>;
  allow_stdin?: boolean;
}

interface ExecuteResult {
  execution_count: number;
  data: {
    'text/plain'?: string;
    'text/html'?: string;
    'image/png'?: string;
    [key: string]: any;
  };
  metadata: Record<string, any>;
}

interface ExecuteResponse {
  msg_id: string;
  msg_type: string;
  content: ExecuteResult | { execution_count: number; status: string };
}

class JupyterKernelClient {
  private baseUrl: string;
  private kernelId: string | null = null;

  constructor(baseUrl: string = 'http://jupyter-kernel-gateway:8888') {
    this.baseUrl = baseUrl;
  }

  async getKernelSpecs(): Promise<Record<string, KernelSpec>> {
    const response = await fetch(`${this.baseUrl}/api/kernelspecs`);
    if (!response.ok) {
      throw new Error(`Failed to get kernel specs: ${response.statusText}`);
    }
    const data = await response.json();
    return data.kernelspecs;
  }

  async startKernel(kernelName: string = 'python3'): Promise<string> {
    console.log(`${this.baseUrl}/api/kernels`);
    const response = await fetch(`${this.baseUrl}/api/kernels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

  async getKernels(): Promise<KernelInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/kernels`);
    if (!response.ok) {
      throw new Error(`Failed to get kernels: ${response.statusText}`);
    }
    return await response.json();
  }

  async executeCode(code: string): Promise<any> {
    if (!this.kernelId) {
      throw new Error('No kernel started. Call startKernel() first.');
    }

    const executeRequest: ExecuteRequest = {
      code,
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false,
    };

    const response = await fetch(`${this.baseUrl}/api/kernels/${this.kernelId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(executeRequest),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute code: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get kernel status
  async getKernelStatus(): Promise<any> {
    if (!this.kernelId) {
      throw new Error('No kernel started.');
    }

    const response = await fetch(`${this.baseUrl}/api/kernels/${this.kernelId}`);
    if (!response.ok) {
      throw new Error(`Failed to get kernel status: ${response.statusText}`);
    }
    return await response.json();
  }

  // Shutdown kernel
  async shutdownKernel(): Promise<void> {
    if (!this.kernelId) {
      return;
    }

    const response = await fetch(`${this.baseUrl}/api/kernels/${this.kernelId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to shutdown kernel: ${response.statusText}`);
    }

    this.kernelId = null;
  }
}


// For use in React/Next.js components
export class JupyterService {
  private client: JupyterKernelClient;

  constructor(baseUrl?: string) {
    this.client = new JupyterKernelClient(baseUrl);
  }

  async initialize(): Promise<void> {
    await this.client.startKernel();
  }

  async runPythonCode(code: string): Promise<any> {
    return await this.client.executeCode(code);
  }

  async cleanup(): Promise<void> {
    await this.client.shutdownKernel();
  }
}

export { JupyterKernelClient };
export default JupyterKernelClient;