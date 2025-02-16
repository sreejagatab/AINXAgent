import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/auth';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { config } from '../config';
import type { SocketEvent, SocketUser } from '../types/socket.types';

export class WebSocketServer {
  private static instance: WebSocketServer;
  private io: Server;
  private readonly SOCKET_PREFIX = 'socket:';

  private constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/ws',
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  public static getInstance(httpServer: HttpServer): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer(httpServer);
    }
    return WebSocketServer.instance;
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication token required');
        }

        const user = await verifyToken(token);
        if (!user) {
          throw new Error('Invalid token');
        }

        socket.data.user = user;
        await this.trackUserSocket(user.id, socket.id);
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;
      logger.info('Client connected:', { userId: user.id, socketId: socket.id });

      // Join user's private room
      socket.join(`user:${user.id}`);

      socket.on('disconnect', async () => {
        await this.removeUserSocket(user.id, socket.id);
        logger.info('Client disconnected:', { userId: user.id, socketId: socket.id });
      });

      // Handle custom events
      this.setupCustomEventHandlers(socket);
    });
  }

  private setupCustomEventHandlers(socket: any) {
    socket.on('join:document', (documentId: string) => {
      socket.join(`document:${documentId}`);
    });

    socket.on('leave:document', (documentId: string) => {
      socket.leave(`document:${documentId}`);
    });

    // Add more custom event handlers as needed
  }

  public async emitToUser(userId: string, event: SocketEvent, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public async emitToDocument(documentId: string, event: SocketEvent, data: any) {
    this.io.to(`document:${documentId}`).emit(event, data);
  }

  public async broadcastToAll(event: SocketEvent, data: any) {
    this.io.emit(event, data);
  }

  private async trackUserSocket(userId: string, socketId: string) {
    await redis.sadd(`${this.SOCKET_PREFIX}${userId}`, socketId);
  }

  private async removeUserSocket(userId: string, socketId: string) {
    await redis.srem(`${this.SOCKET_PREFIX}${userId}`, socketId);
  }

  public async getUserSockets(userId: string): Promise<string[]> {
    return await redis.smembers(`${this.SOCKET_PREFIX}${userId}`);
  }
} 