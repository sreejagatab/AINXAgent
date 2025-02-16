import { WebSocketService } from '../../src/services/websocket.service';
import { JwtService } from '../../src/services/jwt.service';
import WebSocket from 'ws';
import { createServer } from 'http';

jest.mock('../../src/services/jwt.service');

describe('WebSocketService', () => {
  let wss: WebSocketService;
  let server: any;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeAll(() => {
    server = createServer();
    mockJwtService = {
      verifyToken: jest.fn(),
      getInstance: jest.fn(),
    } as any;

    (JwtService.getInstance as jest.Mock).mockReturnValue(mockJwtService);
    WebSocketService.initialize(server);
    wss = WebSocketService.getInstance();
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('connection handling', () => {
    it('should authenticate connections with valid token', (done) => {
      mockJwtService.verifyToken.mockResolvedValueOnce({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'USER',
      });

      const ws = new WebSocket(
        `ws://localhost:${(server.address() as any).port}?token=valid-token`
      );

      ws.on('open', () => {
        expect(mockJwtService.verifyToken).toHaveBeenCalledWith('valid-token');
        ws.close();
        done();
      });
    });

    it('should reject connections with invalid token', (done) => {
      mockJwtService.verifyToken.mockResolvedValueOnce(null);

      const ws = new WebSocket(
        `ws://localhost:${(server.address() as any).port}?token=invalid-token`
      );

      ws.on('close', (code) => {
        expect(code).toBe(1008); // Policy violation
        done();
      });
    });
  });

  describe('message handling', () => {
    it('should handle valid messages', (done) => {
      mockJwtService.verifyToken.mockResolvedValueOnce({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'USER',
      });

      const ws = new WebSocket(
        `ws://localhost:${(server.address() as any).port}?token=valid-token`
      );

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'test', data: 'message' }));
        // Add expectations for message handling
        ws.close();
        done();
      });
    });
  });

  describe('client management', () => {
    it('should track connected clients', (done) => {
      mockJwtService.verifyToken.mockResolvedValueOnce({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'USER',
      });

      const ws = new WebSocket(
        `ws://localhost:${(server.address() as any).port}?token=valid-token`
      );

      ws.on('open', () => {
        // Test sending message to specific user
        wss.sendToUser('test-user', {
          type: 'test',
          data: 'message',
        });

        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          expect(message).toEqual({
            type: 'test',
            data: 'message',
          });
          ws.close();
          done();
        });
      });
    });
  });
}); 