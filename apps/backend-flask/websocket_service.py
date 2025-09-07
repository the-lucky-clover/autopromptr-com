"""
WebSocket service for real-time communication
"""
import asyncio
import json
import logging
from typing import Set, Dict, Any
import websockets
from websockets.server import WebSocketServerProtocol

logger = logging.getLogger(__name__)

class WebSocketService:
    def __init__(self):
        self.clients: Set[WebSocketServerProtocol] = set()
        self.client_subscriptions: Dict[WebSocketServerProtocol, Set[str]] = {}
        
    async def register_client(self, websocket: WebSocketServerProtocol):
        """Register a new WebSocket client"""
        self.clients.add(websocket)
        self.client_subscriptions[websocket] = set()
        logger.info(f"WebSocket client registered. Total clients: {len(self.clients)}")
        
        # Send welcome message
        await self.send_to_client(websocket, {
            'type': 'connection_established',
            'message': 'Connected to AutoPromptr WebSocket service',
            'client_id': id(websocket)
        })
    
    async def unregister_client(self, websocket: WebSocketServerProtocol):
        """Unregister a WebSocket client"""
        self.clients.discard(websocket)
        if websocket in self.client_subscriptions:
            del self.client_subscriptions[websocket]
        logger.info(f"WebSocket client unregistered. Total clients: {len(self.clients)}")
    
    async def handle_message(self, websocket: WebSocketServerProtocol, message: str):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(message)
            message_type = data.get('type')
            
            if message_type == 'subscribe':
                await self.handle_subscription(websocket, data)
            elif message_type == 'unsubscribe':
                await self.handle_unsubscription(websocket, data)
            elif message_type == 'ping':
                await self.send_to_client(websocket, {'type': 'pong'})
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from client: {message}")
            await self.send_to_client(websocket, {
                'type': 'error',
                'message': 'Invalid JSON format'
            })
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {str(e)}")
            await self.send_to_client(websocket, {
                'type': 'error',
                'message': str(e)
            })
    
    async def handle_subscription(self, websocket: WebSocketServerProtocol, data: Dict[str, Any]):
        """Handle subscription request"""
        channels = data.get('channels', [])
        
        if websocket not in self.client_subscriptions:
            self.client_subscriptions[websocket] = set()
        
        for channel in channels:
            self.client_subscriptions[websocket].add(channel)
        
        await self.send_to_client(websocket, {
            'type': 'subscription_confirmed',
            'channels': list(self.client_subscriptions[websocket])
        })
        
        logger.info(f"Client subscribed to channels: {channels}")
    
    async def handle_unsubscription(self, websocket: WebSocketServerProtocol, data: Dict[str, Any]):
        """Handle unsubscription request"""
        channels = data.get('channels', [])
        
        if websocket in self.client_subscriptions:
            for channel in channels:
                self.client_subscriptions[websocket].discard(channel)
        
        await self.send_to_client(websocket, {
            'type': 'unsubscription_confirmed',
            'channels': channels
        })
        
        logger.info(f"Client unsubscribed from channels: {channels}")
    
    async def send_to_client(self, websocket: WebSocketServerProtocol, message: Dict[str, Any]):
        """Send message to a specific client"""
        try:
            await websocket.send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            await self.unregister_client(websocket)
        except Exception as e:
            logger.error(f"Error sending message to client: {str(e)}")
    
    async def broadcast_to_channel(self, channel: str, message: Dict[str, Any]):
        """Broadcast message to all clients subscribed to a channel"""
        message['channel'] = channel
        
        disconnected_clients = []
        
        for websocket, subscriptions in self.client_subscriptions.items():
            if channel in subscriptions:
                try:
                    await websocket.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.append(websocket)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {str(e)}")
        
        # Clean up disconnected clients
        for websocket in disconnected_clients:
            await self.unregister_client(websocket)
        
        logger.debug(f"Broadcasted message to channel '{channel}' to {len(self.client_subscriptions)} clients")
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        disconnected_clients = []
        
        for websocket in self.clients:
            try:
                await websocket.send(json.dumps(message))
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.append(websocket)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
        
        # Clean up disconnected clients
        for websocket in disconnected_clients:
            await self.unregister_client(websocket)
        
        logger.debug(f"Broadcasted message to all {len(self.clients)} clients")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket service statistics"""
        channel_stats = {}
        for subscriptions in self.client_subscriptions.values():
            for channel in subscriptions:
                channel_stats[channel] = channel_stats.get(channel, 0) + 1
        
        return {
            'total_clients': len(self.clients),
            'total_subscriptions': sum(len(subs) for subs in self.client_subscriptions.values()),
            'channels': channel_stats
        }

# Global WebSocket service instance
websocket_service = WebSocketService()

async def websocket_handler(websocket: WebSocketServerProtocol, path: str):
    """Main WebSocket handler function"""
    await websocket_service.register_client(websocket)
    
    try:
        async for message in websocket:
            await websocket_service.handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        logger.error(f"WebSocket handler error: {str(e)}")
    finally:
        await websocket_service.unregister_client(websocket)

def start_websocket_server(host: str = 'localhost', port: int = 8765):
    """Start the WebSocket server"""
    logger.info(f"Starting WebSocket server on {host}:{port}")
    return websockets.serve(websocket_handler, host, port)