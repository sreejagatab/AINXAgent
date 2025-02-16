import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import { WebSocketServer } from '../websocket/server';
import { createTestUser, generateTestToken } from '../test/setup';
import { redis } from '../lib/redis';
import { config } from '../config';

describe('WebSocket Server', () => {
  let httpServer: any;
  let wsServer: WebSocketServer;
  let wsClient: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    httpServer = createServer();
    wsServer = WebSocketServer.getInstance(httpServer);
    httpServer.listen(config.WS_PORT);

    testUser = await createTestUser();
    authToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    await redis.flushall();
    await httpServer.close();
    if (wsClient) await wsClient.close();
  });

  beforeEach(async () => {
    wsClient = Client(`http://localhost:${config.WS_PORT}`, {
      path: '/ws',
      auth: { token: authToken },
    });
  });

  afterEach(async () => {
    if (wsClient) await wsClient.close();
  });

  it('should connect with valid authentication', (done) => {
    wsClient.on('connect', () => {
      expect(wsClient.connected).toBe(true);
      done();
    });
  });

  it('should reject connection without token', (done) => {
    const unauthClient = Client(`http://localhost:${config.WS_PORT}`, {
      path: '/ws',
    });

    unauthClient.on('connect_error', (error) => {
      expect(error.message).toBe('Authentication failed');
      unauthClient.close();
      done();
    });
  });

  it('should handle document updates', (done) => {
    const documentId = 'test-doc-123';
    const changes = [
      {
        type: 'insert' as const,
        position: 0,
        content: 'Hello, World!',
      },
    ];

    wsClient.emit('join:document', documentId);

    wsClient.on('document:updated', (data) => {
      expect(data.documentId).toBe(documentId);
      expect(data.changes).toEqual(changes);
      expect(data.userId).toBe(testUser.id);
      done();
    });

    wsClient.emit('document:update', {
      documentId,
      changes,
      version: 1,
    });
  });

  it('should handle user presence', (done) => {
    const documentId = 'test-doc-123';

    wsClient.emit('join:document', documentId);

    wsClient.on('user:joined', (data) => {
      expect(data.userId).toBe(testUser.id);
      expect(data.name).toBe(testUser.name);
      done();
    });

    wsClient.emit('presence:update', {
      documentId,
      action: 'join',
    });
  });

  it('should enforce rate limiting', (done) => {
    const promises = Array(150).fill(0).map(() => 
      new Promise<void>((resolve) => {
        wsClient.emit('ping', {}, () => resolve());
      })
    );

    Promise.all(promises).then(() => {
      wsClient.on('error', (error) => {
        expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
        done();
      });

      wsClient.emit('ping');
    });
  });
}); 