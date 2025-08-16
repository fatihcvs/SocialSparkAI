import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import cacheService from './cacheService';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface RoomSubscription {
  userId: string;
  rooms: Set<string>;
}

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // room -> userIds
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> rooms
  private cache = cacheService;

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
  }

  private async verifyClient(info: { req: IncomingMessage }): Promise<boolean> {
    try {
      const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) return false;

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return !!decoded.userId;
    } catch (error) {
      return false;
    }
  }

  private async handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage) {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'No token provided');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId;

      ws.userId = userId;
      ws.isAlive = true;
      this.clients.set(userId, ws);

      // Send welcome message
      this.sendToUser(userId, {
        type: 'connected',
        data: { userId, timestamp: Date.now() },
        timestamp: Date.now()
      });

      // Join default rooms
      this.joinRoom(userId, 'dashboard');
      this.joinRoom(userId, `user_${userId}`);

      ws.on('message', (data) => this.handleMessage(ws, data));
      ws.on('close', () => this.handleDisconnection(userId));
      ws.on('pong', () => { ws.isAlive = true; });

      console.log(`WebSocket connected: ${userId}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const message = JSON.parse(data.toString());
      const userId = ws.userId!;

      switch (message.type) {
        case 'join_room':
          this.joinRoom(userId, message.room);
          break;
        case 'leave_room':
          this.leaveRoom(userId, message.room);
          break;
        case 'ping':
          this.sendToUser(userId, { type: 'pong', data: {}, timestamp: Date.now() });
          break;
        case 'subscribe_stats':
          this.joinRoom(userId, 'stats_updates');
          break;
        case 'subscribe_posts':
          this.joinRoom(userId, 'posts_updates');
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleDisconnection(userId: string) {
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(room => this.leaveRoom(userId, room));
    }
    
    this.clients.delete(userId);
    this.userRooms.delete(userId);
    console.log(`WebSocket disconnected: ${userId}`);
  }

  public joinRoom(userId: string, room: string) {
    // Add user to room
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(userId);

    // Track user rooms
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(room);

    // Notify user
    this.sendToUser(userId, {
      type: 'room_joined',
      data: { room },
      timestamp: Date.now()
    });
  }

  public leaveRoom(userId: string, room: string) {
    const roomUsers = this.rooms.get(room);
    if (roomUsers) {
      roomUsers.delete(userId);
      if (roomUsers.size === 0) {
        this.rooms.delete(room);
      }
    }

    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.delete(room);
    }

    this.sendToUser(userId, {
      type: 'room_left',
      data: { room },
      timestamp: Date.now()
    });
  }

  public sendToUser(userId: string, message: WebSocketMessage) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public sendToRoom(room: string, message: WebSocketMessage, excludeUser?: string) {
    const roomUsers = this.rooms.get(room);
    if (!roomUsers) return;

    roomUsers.forEach(userId => {
      if (excludeUser && userId === excludeUser) return;
      this.sendToUser(userId, message);
    });
  }

  public broadcast(message: WebSocketMessage, excludeUser?: string) {
    this.clients.forEach((client, userId) => {
      if (excludeUser && userId === excludeUser) return;
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Real-time dashboard updates
  public broadcastStatsUpdate(stats: any) {
    this.sendToRoom('stats_updates', {
      type: 'stats_updated',
      data: stats,
      timestamp: Date.now()
    });
  }

  public broadcastPostUpdate(post: any, action: 'created' | 'updated' | 'deleted') {
    this.sendToRoom('posts_updates', {
      type: 'post_updated',
      data: { post, action },
      timestamp: Date.now()
    });
  }

  public notifyUserActivity(userId: string, activity: any) {
    this.sendToUser(userId, {
      type: 'activity_notification',
      data: activity,
      timestamp: Date.now()
    });
  }

  public broadcastSystemNotification(notification: any) {
    this.broadcast({
      type: 'system_notification',
      data: notification,
      timestamp: Date.now()
    });
  }

  // AI generation progress updates
  public notifyAIProgress(userId: string, progress: { step: string; percentage: number; message?: string }) {
    this.sendToUser(userId, {
      type: 'ai_progress',
      data: progress,
      timestamp: Date.now()
    });
  }

  private startHeartbeat() {
    setInterval(() => {
      this.clients.forEach((client, userId) => {
        if (!client.isAlive) {
          this.handleDisconnection(userId);
          return client.terminate();
        }
        
        client.isAlive = false;
        client.ping();
      });
    }, 30000); // 30 seconds
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  public getRoomUsers(room: string): string[] {
    return Array.from(this.rooms.get(room) || []);
  }

  public getUserRooms(userId: string): string[] {
    return Array.from(this.userRooms.get(userId) || []);
  }

  public getStats() {
    return {
      connectedUsers: this.clients.size,
      totalRooms: this.rooms.size,
      roomStats: Array.from(this.rooms.entries()).map(([room, users]) => ({
        room,
        userCount: users.size
      }))
    };
  }
}

let wsService: WebSocketService;

export function initializeWebSocketService(server: any) {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
}