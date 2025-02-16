import { logger } from './logger';
import { performanceService } from '../services/performance.service';

interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  retryAttempts: number;
}

interface BatchItem<T> {
  id: string;
  data: T;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

class ApiBatchProcessor<T> {
  private batch: BatchItem<T>[] = [];
  private timeoutId?: number;
  private readonly config: BatchConfig;

  constructor(
    private processBatch: (items: T[]) => Promise<any[]>,
    config: Partial<BatchConfig> = {}
  ) {
    this.config = {
      maxBatchSize: config.maxBatchSize || 100,
      maxWaitTime: config.maxWaitTime || 50, // ms
      retryAttempts: config.retryAttempts || 3,
    };
  }

  public async add(id: string, data: T): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batch.push({ id, data, resolve, reject });

      if (this.batch.length >= this.config.maxBatchSize) {
        this.processPendingBatch();
      } else if (!this.timeoutId) {
        this.timeoutId = window.setTimeout(
          () => this.processPendingBatch(),
          this.config.maxWaitTime
        );
      }
    });
  }

  private async processPendingBatch(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    const currentBatch = [...this.batch];
    this.batch = [];

    if (currentBatch.length === 0) return;

    try {
      const results = await performanceService.measureAsync(
        'batch_process',
        () => this.processBatch(currentBatch.map(item => item.data))
      );

      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });

      logger.debug('Batch processed successfully', {
        batchSize: currentBatch.length,
        duration: performance.now(),
      });
    } catch (error) {
      logger.error('Batch processing failed', {
        error,
        batchSize: currentBatch.length,
      });

      currentBatch.forEach(item => {
        item.reject(error as Error);
      });
    }
  }

  public clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.batch = [];
  }
}

export const createBatchProcessor = <T>(
  processBatch: (items: T[]) => Promise<any[]>,
  config?: Partial<BatchConfig>
): ApiBatchProcessor<T> => {
  return new ApiBatchProcessor<T>(processBatch, config);
}; 