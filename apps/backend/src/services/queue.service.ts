import Bull, { Queue, Job } from 'bull';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { config } from '../config';
import type { JobType, JobData, JobResult } from '../types/queue.types';

export class QueueService {
  private static instance: QueueService;
  private queues: Map<JobType, Queue>;
  private readonly DEFAULT_JOB_OPTIONS = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  };

  private constructor() {
    this.queues = new Map();
    this.initializeQueues();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private initializeQueues() {
    // Initialize each job type queue
    const jobTypes: JobType[] = [
      'email',
      'notification',
      'document-processing',
      'analytics',
      'cleanup',
    ];

    for (const type of jobTypes) {
      const queue = new Bull(type, {
        redis: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          password: config.REDIS_PASSWORD,
        },
        defaultJobOptions: this.DEFAULT_JOB_OPTIONS,
      });

      // Set up event handlers
      queue.on('error', error => {
        logger.error(`Queue ${type} error:`, error);
      });

      queue.on('failed', (job, error) => {
        logger.error(`Job ${type}:${job.id} failed:`, error);
      });

      queue.on('completed', (job, result) => {
        logger.info(`Job ${type}:${job.id} completed:`, result);
      });

      this.queues.set(type, queue);
    }
  }

  public async addJob<T extends JobType>(
    type: T,
    data: JobData[T],
    options?: Bull.JobOptions
  ): Promise<Job<JobData[T]>> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue ${type} not found`);
    }

    return await queue.add(data, {
      ...this.DEFAULT_JOB_OPTIONS,
      ...options,
    });
  }

  public async getJob<T extends JobType>(
    type: T,
    jobId: string
  ): Promise<Job<JobData[T]> | null> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue ${type} not found`);
    }

    return await queue.getJob(jobId);
  }

  public async processJobs<T extends JobType>(
    type: T,
    concurrency: number,
    processor: (job: Job<JobData[T]>) => Promise<JobResult[T]>
  ): Promise<void> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue ${type} not found`);
    }

    queue.process(concurrency, processor);
  }

  public async getQueueStats(type: JobType) {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue ${type} not found`);
    }

    const [
      jobCounts,
      completedCount,
      failedCount,
      delayedCount,
    ] = await Promise.all([
      queue.getJobCounts(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      ...jobCounts,
      completed: completedCount,
      failed: failedCount,
      delayed: delayedCount,
    };
  }

  public async cleanQueue(type: JobType): Promise<void> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue ${type} not found`);
    }

    await queue.clean(24 * 3600 * 1000, 'completed'); // Clean completed jobs older than 24h
    await queue.clean(7 * 24 * 3600 * 1000, 'failed'); // Clean failed jobs older than 7d
  }
}

export const queueService = QueueService.getInstance(); 