import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';
import { redis } from '../lib/redis';
import { config } from '../config';
import type { AuthUser } from '../types/auth.types';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: WebSocketServer;
  private userSockets: Map<string, Set<string>> = new Map();
  private readonly PRESENCE_CHANNEL = 'presence';
  private readonly EVENT_CHANNEL = 'events';

  private constructor(server: HTTPServer) {
    this.io = new WebSocketServer(server, {
      path: '/ws',
      cors: {
        origin: config.security.corsOrigins,
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  public static getInstance(server?: HTTPServer): WebSocketManager {
    if (!WebSocketManager.instance && server) {
      WebSocketManager.instance = new WebSocketManager(server);
    }
    return WebSocketManager.instance;
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication required');
        }

        const user = await verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user as AuthUser;
      this.handleConnection(socket, user);

      socket.on('disconnect', () => {
        this.handleDisconnection(socket, user);
      });

      // Handle AI stream subscription
      socket.on('subscribe:ai-stream', (streamId: string) => {
        socket.join(`ai-stream:${streamId}`);
      });

      // Handle tool execution updates
      socket.on('subscribe:tool-execution', (executionId: string) => {
        socket.join(`tool-execution:${executionId}`);
      });
    });
  }

  private handleConnection(socket: Socket, user: AuthUser) {
    // Track user's socket connections
    if (!this.userSockets.has(user.id)) {
      this.userSockets.set(user.id, new Set());
    }
    this.userSockets.get(user.id)!.add(socket.id);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Update presence
    this.updatePresence(user.id, true);

    logger.info('WebSocket client connected', {
      userId: user.id,
      socketId: socket.id,
    });
  }

  private handleDisconnection(socket: Socket, user: AuthUser) {
    // Remove socket from tracking
    const userSockets = this.userSockets.get(user.id);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.userSockets.delete(user.id);
        this.updatePresence(user.id, false);
      }
    }

    logger.info('WebSocket client disconnected', {
      userId: user.id,
      socketId: socket.id,
    });
  }

  private async updatePresence(userId: string, online: boolean) {
    try {
      await redis.hset(
        'presence',
        userId,
        JSON.stringify({
          online,
          lastSeen: new Date().toISOString(),
        })
      );

      this.io.to(this.PRESENCE_CHANNEL).emit('presence:update', {
        userId,
        online,
      });
    } catch (error) {
      logger.error('Error updating presence:', error);
    }
  }

  public async emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public async emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public async emitToAIStream(streamId: string, chunk: string) {
    this.io.to(`ai-stream:${streamId}`).emit('ai:chunk', {
      streamId,
      chunk,
    });
  }

  public async emitToolExecution(executionId: string, data: any) {
    this.io.to(`tool-execution:${executionId}`).emit('tool:update', {
      executionId,
      ...data,
    });
  }
} 