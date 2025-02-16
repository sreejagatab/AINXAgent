import { z } from 'zod';
import { ApiError } from '../utils/errors';
import type { WebSocketEvent } from '../types/websocket.types';

const webSocketEventEnum = z.enum([
  'notification',
  'document:update',
  'comment:create',
  'user:status',
  'chat:message',
]);

export const broadcastSchema = z.object({
  event: webSocketEventEnum,
  data: z.any(),
  room: z.string().optional(),
});

export const roomSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['user', 'document', 'chat']),
});

export async function validateBroadcast(data: unknown): Promise<{
  event: WebSocketEvent;
  data: any;
  room?: string;
}> {
  try {
    return await broadcastSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid broadcast data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
}

export async function validateRoom(data: unknown): Promise<{
  name: string;
  type: 'user' | 'document' | 'chat';
}> {
  try {
    return await roomSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid room data', 'VALIDATION_ERROR', {
        errors: error.errors,
      });
    }
    throw error;
  }
} 