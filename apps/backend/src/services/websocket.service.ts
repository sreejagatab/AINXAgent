import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/auth';
import type { 
  WebSocketEvent, 
  WebSocketRoom,
  SocketClient,
  WebSocketMetrics 
} from '../types/websocket.types';

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketServer;
  private readonly CACHE_PREFIX = 'ws:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/ws',
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupHeartbeat();
  }

  public static initialize(server: Server): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      throw new Error('WebSocket service not initialized');
    }
    return WebSocketService.instance;
  }

  public async broadcast(
    event: WebSocketEvent,
    data: any,
    room?: string
  ): Promise<void> {
    try {
      if (room) {
        this.io.to(room).emit(event, data);
      } else {
        this.io.emit(event, data);
      }

      await this.trackEvent(event, room);
    } catch (error) {
      logger.error('WebSocket broadcast failed:', error);
      throw error;
    }
  }

  public async getConnectedClients(): Promise<SocketClient[]> {
    try {
      const sockets = await this.io.fetchSockets();
      return sockets.map(socket => ({
        id: socket.id,
        userId: socket.data.userId,
        rooms: Array.from(socket.rooms),
        connected: socket.connected,
        handshake: socket.handshake,
      }));
    } catch (error) {
      logger.error('Failed to get connected clients:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication required');
        }

        const user = await verifyToken(token);
        if (!user) {
          throw new Error('Invalid token');
        }

        socket.data.userId = user.id;
        next();
      } catch (error) {
        next(error);
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', async (socket) => {
      try {
        logger.info('Client connected:', socket.id);

        // Join user's personal room
        const userRoom = `user:${socket.data.userId}`;
        await socket.join(userRoom);

        // Handle room subscriptions
        socket.on('join', async (rooms: string[]) => {
          try {
            await this.handleRoomJoin(socket, rooms);
          } catch (error) {
            logger.error('Room join failed:', error);
          }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
          try {
            await this.handleDisconnect(socket);
          } catch (error) {
            logger.error('Disconnect handling failed:', error);
          }
        });

        // Track connection
        await this.trackConnection(socket);
      } catch (error) {
        logger.error('Connection handling failed:', error);
      }
    });
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      this.io.emit('ping');
    }, 30000); // Every 30 seconds
  }

  private async handleRoomJoin(
    socket: any,
    rooms: string[]
  ): Promise<void> {
    // Validate room access
    const allowedRooms = await this.validateRoomAccess(
      socket.data.userId,
      rooms
    );

    // Join allowed rooms
    for (const room of allowedRooms) {
      await socket.join(room);
      logger.debug('Client joined room:', { socketId: socket.id, room });
    }
  }

  private async handleDisconnect(socket: any): Promise<void> {
    logger.info('Client disconnected:', socket.id);
    await this.trackDisconnection(socket);
  }

  private async validateRoomAccess(
    userId: string,
    rooms: string[]
  ): Promise<string[]> {
    // Implement room access validation logic
    // For example, check if user has access to document rooms
    const allowedRooms = [];
    for (const room of rooms) {
      if (room.startsWith('document:')) {
        const documentId = room.split(':')[1];
        const hasAccess = await this.checkDocumentAccess(userId, documentId);
        if (hasAccess) {
          allowedRooms.push(room);
        }
      }
    }
    return allowedRooms;
  }

  private async checkDocumentAccess(
    userId: string,
    documentId: string
  ): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    return document?.authorId === userId || document?.published;
  }

  private async trackConnection(socket: any): Promise<void> {
    const key = `${this.CACHE_PREFIX}connections:${socket.data.userId}`;
    await redis.sadd(key, socket.id);
    await redis.expire(key, this.CACHE_TTL);
  }

  private async trackDisconnection(socket: any): Promise<void> {
    const key = `${this.CACHE_PREFIX}connections:${socket.data.userId}`;
    await redis.srem(key, socket.id);
  }

  private async trackEvent(
    event: WebSocketEvent,
    room?: string
  ): Promise<void> {
    try {
      await prisma.websocketMetrics.create({
        data: {
          event,
          room,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to track WebSocket event:', error);
    }
  }
}

export const websocketService = WebSocketService.getInstance(); 