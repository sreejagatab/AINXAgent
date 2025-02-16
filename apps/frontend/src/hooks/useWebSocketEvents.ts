import { useEffect, useCallback } from 'react';
import { useWebSocket } from '../providers/WebSocketProvider';

interface UseWebSocketEventsOptions<T> {
  event: string;
  onMessage: (data: T) => void;
  enabled?: boolean;
}

export function useWebSocketEvents<T>({
  event,
  onMessage,
  enabled = true,
}: UseWebSocketEventsOptions<T>) {
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    if (!enabled) return;

    subscribe(event, onMessage);
    return () => unsubscribe(event, onMessage);
  }, [event, onMessage, enabled, subscribe, unsubscribe]);
}

export function useAIStream(streamId: string) {
  const { subscribe, unsubscribe } = useWebSocket();
  const [chunks, setChunks] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const handleChunk = (data: { streamId: string; chunk: string }) => {
      if (data.streamId === streamId) {
        setChunks((prev) => [...prev, data.chunk]);
      }
    };

    const handleComplete = (data: { streamId: string }) => {
      if (data.streamId === streamId) {
        setIsComplete(true);
      }
    };

    subscribe('ai:chunk', handleChunk);
    subscribe('ai:complete', handleComplete);

    return () => {
      unsubscribe('ai:chunk', handleChunk);
      unsubscribe('ai:complete', handleComplete);
    };
  }, [streamId, subscribe, unsubscribe]);

  return {
    chunks,
    isComplete,
    content: chunks.join(''),
  };
}

export function useToolExecution(executionId: string) {
  const { subscribe, unsubscribe } = useWebSocket();
  const [status, setStatus] = useState<string>('pending');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (data: {
      executionId: string;
      status: string;
      result?: any;
      error?: string;
    }) => {
      if (data.executionId === executionId) {
        setStatus(data.status);
        if (data.result) setResult(data.result);
        if (data.error) setError(data.error);
      }
    };

    subscribe('tool:update', handleUpdate);
    return () => unsubscribe('tool:update', handleUpdate);
  }, [executionId, subscribe, unsubscribe]);

  return {
    status,
    result,
    error,
    isComplete: status === 'completed' || status === 'error',
  };
} 