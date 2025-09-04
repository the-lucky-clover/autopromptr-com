// Real-Time WebSocket Service for AutoPromptr
const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Map();
    this.rooms = new Map();
    
    this.setupWebSocket();
    this.setupHeartbeat();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      console.log(`WebSocket client connected: ${clientId}`);
      
      // Store client
      this.clients.set(clientId, {
        ws,
        id: clientId,
        userId: null,
        rooms: new Set(),
        lastPing: Date.now()
      });

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Invalid message format:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.handleDisconnect(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
        this.handleDisconnect(clientId);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        clientId,
        message: 'Connected to AutoPromptr WebSocket'
      }));
    });
  }

  setupHeartbeat() {
    // Ping clients every 30 seconds
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 30000);

    // Clean up dead connections
    setInterval(() => {
      const now = Date.now();
      for (const [clientId, client] of this.clients) {
        if (now - client.lastPing > 60000) { // 60 second timeout
          console.log(`Cleaning up dead connection: ${clientId}`);
          this.handleDisconnect(clientId);
        }
      }
    }, 60000);
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastPing = Date.now();

    switch (message.type) {
      case 'auth':
        this.handleAuth(clientId, message);
        break;
      
      case 'join_room':
        this.handleJoinRoom(clientId, message.room);
        break;
      
      case 'leave_room':
        this.handleLeaveRoom(clientId, message.room);
        break;
      
      case 'batch_update':
        this.handleBatchUpdate(clientId, message);
        break;
      
      case 'agent_status':
        this.handleAgentStatus(clientId, message);
        break;
      
      case 'platform_detection':
        this.handlePlatformDetection(clientId, message);
        break;
      
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;
      
      default:
        client.ws.send(JSON.stringify({ 
          error: `Unknown message type: ${message.type}` 
        }));
    }
  }

  async handleAuth(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      // Verify JWT token
      const token = message.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      
      client.userId = decoded.userId || decoded.sub;
      client.userEmail = decoded.email;
      
      // Join user's personal room
      this.handleJoinRoom(clientId, `user_${client.userId}`);
      
      client.ws.send(JSON.stringify({
        type: 'auth_success',
        userId: client.userId
      }));
      
      console.log(`Client ${clientId} authenticated as user ${client.userId}`);
      
    } catch (error) {
      client.ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Invalid token'
      }));
    }
  }

  handleJoinRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Add client to room
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    
    this.rooms.get(roomName).add(clientId);
    client.rooms.add(roomName);
    
    client.ws.send(JSON.stringify({
      type: 'joined_room',
      room: roomName
    }));
    
    // Notify other clients in room
    this.broadcastToRoom(roomName, {
      type: 'user_joined',
      clientId,
      userId: client.userId
    }, clientId);
    
    console.log(`Client ${clientId} joined room ${roomName}`);
  }

  handleLeaveRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(clientId);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }
    
    client.rooms.delete(roomName);
    
    client.ws.send(JSON.stringify({
      type: 'left_room',
      room: roomName
    }));
    
    // Notify other clients in room
    this.broadcastToRoom(roomName, {
      type: 'user_left',
      clientId,
      userId: client.userId
    });
  }

  handleBatchUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Broadcast batch updates to all clients in user's room
    const userRoom = `user_${client.userId}`;
    
    this.broadcastToRoom(userRoom, {
      type: 'batch_update',
      batchId: message.batchId,
      status: message.status,
      progress: message.progress,
      timestamp: new Date().toISOString()
    });

    // Also broadcast to batch-specific room
    const batchRoom = `batch_${message.batchId}`;
    this.broadcastToRoom(batchRoom, {
      type: 'batch_update',
      batchId: message.batchId,
      status: message.status,
      progress: message.progress,
      timestamp: new Date().toISOString()
    });
  }

  handleAgentStatus(clientId, message) {
    // Broadcast agent status updates
    this.broadcast({
      type: 'agent_status',
      agentId: message.agentId,
      status: message.status,
      activity: message.activity,
      timestamp: new Date().toISOString()
    });
  }

  handlePlatformDetection(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Broadcast platform detection results
    const userRoom = `user_${client.userId}`;
    
    this.broadcastToRoom(userRoom, {
      type: 'platform_detected',
      platform: message.platform,
      confidence: message.confidence,
      url: message.url,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all rooms
    for (const roomName of client.rooms) {
      this.handleLeaveRoom(clientId, roomName);
    }

    // Remove client
    this.clients.delete(clientId);
    
    // Close WebSocket if still open
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close();
    }
  }

  broadcastToRoom(roomName, message, excludeClientId = null) {
    const room = this.rooms.get(roomName);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    
    for (const clientId of room) {
      if (clientId === excludeClientId) continue;
      
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    }
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    
    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    }
  }

  // Public API methods for external services
  notifyBatchUpdate(batchId, status, progress, userId = null) {
    const message = {
      type: 'batch_update',
      batchId,
      status,
      progress,
      timestamp: new Date().toISOString()
    };

    if (userId) {
      this.broadcastToRoom(`user_${userId}`, message);
    }
    
    this.broadcastToRoom(`batch_${batchId}`, message);
  }

  notifyAgentActivity(agentId, activity) {
    this.broadcast({
      type: 'agent_activity',
      agentId,
      activity,
      timestamp: new Date().toISOString()
    });
  }

  notifyPlatformDetected(platformName, confidence, url, userId) {
    if (userId) {
      this.broadcastToRoom(`user_${userId}`, {
        type: 'platform_detected',
        platform: platformName,
        confidence,
        url,
        timestamp: new Date().toISOString()
      });
    }
  }

  getStats() {
    return {
      connected_clients: this.clients.size,
      active_rooms: this.rooms.size,
      uptime: process.uptime()
    };
  }

  start(port = 8080) {
    this.server.listen(port, '0.0.0.0', () => {
      console.log(`WebSocket service running on port ${port}`);
      console.log(`Connected clients: ${this.clients.size}`);
    });
  }
}

// Start the service
if (require.main === module) {
  const wsService = new WebSocketService();
  wsService.start();
}

module.exports = WebSocketService;