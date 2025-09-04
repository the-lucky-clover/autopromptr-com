// Enterprise SMTP Service with Multi-Provider Support
const express = require('express');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

class SMTPService {
  constructor() {
    this.app = express();
    this.transporters = new Map();
    this.queue = [];
    this.processing = false;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeDatabase();
    this.loadSMTPConfigs();
    this.startQueueProcessor();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        queue_size: this.queue.length,
        active_transporters: this.transporters.size,
        timestamp: new Date().toISOString() 
      });
    });

    // Send email
    this.app.post('/send', async (req, res) => {
      try {
        const {
          to,
          from,
          subject,
          text,
          html,
          template_id,
          template_data,
          priority = 5,
          scheduled_at
        } = req.body;

        const emailId = await this.queueEmail({
          to,
          from,
          subject,
          text,
          html,
          template_id,
          template_data,
          priority,
          scheduled_at
        });

        res.json({ 
          success: true, 
          email_id: emailId,
          status: 'queued'
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Send magic link
    this.app.post('/send-magic-link', async (req, res) => {
      try {
        const { email, magic_link, expires_in = 15 } = req.body;
        
        const emailId = await this.queueEmail({
          to: email,
          template_id: 'magic_link',
          template_data: {
            magic_link,
            expires_in
          },
          priority: 1 // High priority for authentication
        });

        res.json({ 
          success: true, 
          email_id: emailId,
          status: 'queued'
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get email status
    this.app.get('/status/:emailId', async (req, res) => {
      try {
        const { emailId } = req.params;
        const status = await this.getEmailStatus(emailId);
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Queue statistics
    this.app.get('/stats', (req, res) => {
      res.json({
        queue_size: this.queue.length,
        transporters: Array.from(this.transporters.keys()),
        processing: this.processing
      });
    });

    // Add SMTP configuration
    this.app.post('/config', async (req, res) => {
      try {
        const config = await this.addSMTPConfig(req.body);
        res.json({ success: true, config_id: config.id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async initializeDatabase() {
    // For local development, use SQLite. In production, this connects to D1
    if (process.env.NODE_ENV === 'development') {
      this.db = new sqlite3.Database('/app/data/smtp.db');
      
      // Create tables if they don't exist
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS email_queue (
            id TEXT PRIMARY KEY,
            to_email TEXT NOT NULL,
            from_email TEXT,
            subject TEXT NOT NULL,
            body_text TEXT,
            body_html TEXT,
            template_id TEXT,
            template_data TEXT,
            status TEXT DEFAULT 'pending',
            priority INTEGER DEFAULT 5,
            max_retries INTEGER DEFAULT 3,
            retry_count INTEGER DEFAULT 0,
            scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            sent_at DATETIME,
            error_message TEXT,
            smtp_config_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        this.db.run(`
          CREATE TABLE IF NOT EXISTS smtp_configs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            secure BOOLEAN DEFAULT TRUE,
            username TEXT,
            password TEXT,
            from_email TEXT NOT NULL,
            from_name TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            is_default BOOLEAN DEFAULT FALSE
          )
        `);
      });
    }
  }

  async loadSMTPConfigs() {
    try {
      // Load SMTP configurations from database
      const configs = await this.getSMTPConfigs();
      
      for (const config of configs) {
        if (config.is_active) {
          const transporter = nodemailer.createTransporter({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.username ? {
              user: config.username,
              pass: config.password
            } : null,
            pool: true,
            maxConnections: 5,
            maxMessages: 100
          });

          this.transporters.set(config.id, {
            transporter,
            config
          });

          console.log(`Loaded SMTP config: ${config.name}`);
        }
      }
    } catch (error) {
      console.error('Failed to load SMTP configs:', error);
    }
  }

  async queueEmail(emailData) {
    const emailId = 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const email = {
      id: emailId,
      to_email: emailData.to,
      from_email: emailData.from,
      subject: emailData.subject,
      body_text: emailData.text,
      body_html: emailData.html,
      template_id: emailData.template_id,
      template_data: JSON.stringify(emailData.template_data || {}),
      priority: emailData.priority || 5,
      scheduled_at: emailData.scheduled_at || new Date().toISOString(),
      status: 'pending'
    };

    // Save to database
    await this.saveEmailToQueue(email);
    
    // Add to in-memory queue
    this.queue.push(email);
    this.queue.sort((a, b) => a.priority - b.priority); // Higher priority (lower number) first
    
    return emailId;
  }

  async startQueueProcessor() {
    setInterval(async () => {
      if (!this.processing && this.queue.length > 0) {
        this.processing = true;
        
        try {
          const email = this.queue.shift();
          await this.processEmail(email);
        } catch (error) {
          console.error('Queue processing error:', error);
        } finally {
          this.processing = false;
        }
      }
    }, 1000);
  }

  async processEmail(email) {
    try {
      console.log(`Processing email: ${email.id}`);
      
      // Update status to sending
      await this.updateEmailStatus(email.id, 'sending');
      
      // Render template if needed
      if (email.template_id) {
        const rendered = await this.renderTemplate(email);
        email.subject = rendered.subject;
        email.body_html = rendered.body_html;
        email.body_text = rendered.body_text;
      }

      // Select transporter
      const transporterInfo = await this.selectTransporter(email);
      
      if (!transporterInfo) {
        throw new Error('No active SMTP transporter available');
      }

      // Send email
      const result = await transporterInfo.transporter.sendMail({
        from: `${transporterInfo.config.from_name} <${transporterInfo.config.from_email}>`,
        to: email.to_email,
        subject: email.subject,
        text: email.body_text,
        html: email.body_html
      });

      // Update status to sent
      await this.updateEmailStatus(email.id, 'sent', null, new Date().toISOString());
      
      console.log(`Email sent successfully: ${email.id}`);
      
    } catch (error) {
      console.error(`Failed to send email ${email.id}:`, error);
      
      // Handle retry logic
      const retryCount = (email.retry_count || 0) + 1;
      
      if (retryCount <= (email.max_retries || 3)) {
        // Retry later
        email.retry_count = retryCount;
        email.status = 'retrying';
        
        setTimeout(() => {
          this.queue.unshift(email); // Add to front of queue
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        
        await this.updateEmailStatus(email.id, 'retrying', error.message);
      } else {
        // Mark as failed
        await this.updateEmailStatus(email.id, 'failed', error.message);
      }
    }
  }

  async renderTemplate(email) {
    try {
      const template = await this.getEmailTemplate(email.template_id);
      const data = JSON.parse(email.template_data || '{}');
      
      let subject = template.subject;
      let body_html = template.body_html;
      let body_text = template.body_text;
      
      // Simple template variable replacement
      for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, value);
        body_html = body_html.replace(placeholder, value);
        if (body_text) {
          body_text = body_text.replace(placeholder, value);
        }
      }
      
      return { subject, body_html, body_text };
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  async selectTransporter(email) {
    // Select the default transporter or first available
    for (const [id, transporterInfo] of this.transporters) {
      if (transporterInfo.config.is_default || this.transporters.size === 1) {
        return transporterInfo;
      }
    }
    
    return Array.from(this.transporters.values())[0];
  }

  // Database operations
  async saveEmailToQueue(email) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        const stmt = this.db.prepare(`
          INSERT INTO email_queue (
            id, to_email, from_email, subject, body_text, body_html,
            template_id, template_data, priority, scheduled_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run([
          email.id, email.to_email, email.from_email, email.subject,
          email.body_text, email.body_html, email.template_id,
          email.template_data, email.priority, email.scheduled_at, email.status
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Use D1 database in production
      const response = await fetch(process.env.D1_DATABASE_URL + '/email-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save email to queue');
      }
    }
  }

  async updateEmailStatus(emailId, status, errorMessage = null, sentAt = null) {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        const stmt = this.db.prepare(`
          UPDATE email_queue 
          SET status = ?, error_message = ?, sent_at = ?, retry_count = retry_count + 1
          WHERE id = ?
        `);
        
        stmt.run([status, errorMessage, sentAt, emailId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Use D1 database in production
      const response = await fetch(process.env.D1_DATABASE_URL + `/email-queue/${emailId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, errorMessage, sentAt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update email status');
      }
    }
  }

  async getSMTPConfigs() {
    // Return default config for development
    if (process.env.NODE_ENV === 'development') {
      return [{
        id: 'default',
        name: 'Development SMTP',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        username: process.env.SMTP_USER,
        password: process.env.SMTP_PASS,
        from_email: process.env.SMTP_FROM || 'noreply@autopromptr.dev',
        from_name: 'AutoPromptr Dev',
        is_active: true,
        is_default: true
      }];
    } else {
      // Fetch from D1 database
      const response = await fetch(process.env.D1_DATABASE_URL + '/smtp-configs');
      return await response.json();
    }
  }

  async getEmailTemplate(templateId) {
    // Default templates for development
    const templates = {
      magic_link: {
        subject: 'Sign in to AutoPromptr',
        body_html: `
          <h1>Sign in to AutoPromptr</h1>
          <p>Click the link below to sign in:</p>
          <a href="{{magic_link}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Sign In</a>
          <p>This link expires in {{expires_in}} minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
        body_text: 'Sign in to AutoPromptr by clicking this link: {{magic_link}} (expires in {{expires_in}} minutes)'
      }
    };

    if (process.env.NODE_ENV === 'development') {
      return templates[templateId] || templates.magic_link;
    } else {
      // Fetch from D1 database
      const response = await fetch(process.env.D1_DATABASE_URL + `/email-templates/${templateId}`);
      return await response.json();
    }
  }

  async start(port = 2525) {
    this.server = this.app.listen(port, '0.0.0.0', () => {
      console.log(`SMTP Service running on port ${port}`);
      console.log(`Queue processor active`);
    });
  }
}

// Start the service
if (require.main === module) {
  const smtp = new SMTPService();
  smtp.start();
}

module.exports = SMTPService;