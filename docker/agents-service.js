// Autonomous Agents Orchestrator Service
const express = require('express');
const fetch = require('node-fetch');

class AgentsService {
  constructor() {
    this.app = express();
    this.agents = new Map();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', agents: this.agents.size });
    });

    this.app.post('/batch/run', async (req, res) => {
      try {
        const { batchId, platform, prompts } = req.body;
        
        // Create automation session
        const sessionResponse = await fetch(`${process.env.AUTOMATION_URL}/browser/launch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ browserType: 'chromium', headless: true })
        });
        
        const session = await sessionResponse.json();
        
        // Process each prompt
        for (const prompt of prompts) {
          await this.processPrompt(session.sessionId, prompt, platform);
        }
        
        res.json({ success: true, batchId });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async processPrompt(sessionId, prompt, platform) {
    try {
      // Submit prompt to automation service
      const response = await fetch(`${process.env.AUTOMATION_URL}/prompt/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, prompt: prompt.text, platform })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Prompt processing failed:', error);
      throw error;
    }
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`Agents Service running on port ${port}`);
    });
  }
}

if (require.main === module) {
  const agents = new AgentsService();
  agents.start();
}

module.exports = AgentsService;