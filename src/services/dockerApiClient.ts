interface DockerServiceConfig {
  automationUrl: string;
  agentsUrl: string;
  smtpUrl: string;
  websocketUrl: string;
}

class DockerApiClient {
  private config: DockerServiceConfig;

  constructor() {
    this.config = {
      automationUrl: import.meta.env.VITE_AUTOMATION_URL || 'http://localhost:3000',
      agentsUrl: import.meta.env.VITE_AGENTS_URL || 'http://localhost:3001',
      smtpUrl: import.meta.env.VITE_SMTP_URL || 'http://localhost:2525',
      websocketUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080'
    };
  }

  // Automation Service API
  async createBrowserSession(options: { browserType?: string; headless?: boolean }) {
    const response = await fetch(`${this.config.automationUrl}/browser/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return response.json();
  }

  async submitPrompt(sessionId: string, prompt: string, platform: string) {
    const response = await fetch(`${this.config.automationUrl}/prompt/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, prompt, platform })
    });
    return response.json();
  }

  async detectPlatform(url: string) {
    const response = await fetch(`${this.config.automationUrl}/platform/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return response.json();
  }

  // Agents Service API
  async runAutonomousBatch(batchId: string, platform: string, prompts: Array<{ id: string; text: string }>) {
    const response = await fetch(`${this.config.agentsUrl}/batch/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, platform, prompts })
    });
    return response.json();
  }

  async getAgentStatus(agentId: string) {
    const response = await fetch(`${this.config.agentsUrl}/agent/${agentId}/status`);
    return response.json();
  }

  // SMTP Service API
  async sendMagicLink(email: string, redirectUrl?: string) {
    const response = await fetch(`${this.config.smtpUrl}/magic-link/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectUrl })
    });
    return response.json();
  }

  async sendBatchNotification(email: string, batchData: any) {
    const response = await fetch(`${this.config.smtpUrl}/email/batch-completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, batchData })
    });
    return response.json();
  }

  // Batch Control Operations
  async pauseBatch(batchId: string) {
    const response = await fetch(`${this.config.agentsUrl}/batch/${batchId}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async resumeBatch(batchId: string) {
    const response = await fetch(`${this.config.agentsUrl}/batch/${batchId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async stopBatch(batchId: string) {
    const response = await fetch(`${this.config.agentsUrl}/batch/${batchId}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  // WebSocket Connection
  createWebSocketConnection(): WebSocket {
    return new WebSocket(this.config.websocketUrl);
  }

  // Health Checks
  async checkServicesHealth() {
    const services = [
      { name: 'automation', url: `${this.config.automationUrl}/health` },
      { name: 'agents', url: `${this.config.agentsUrl}/health` },
      { name: 'smtp', url: `${this.config.smtpUrl}/health` }
    ];

    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const response = await fetch(service.url);
          return {
            name: service.name,
            status: response.ok ? 'healthy' : 'unhealthy',
            data: await response.json()
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results.map((result, index) => ({
      service: services[index].name,
      ...(result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason })
    }));
  }
}

export const dockerApiClient = new DockerApiClient();
export default DockerApiClient;