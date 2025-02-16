import { EventEmitter } from 'events';

export class PerformanceMonitor {
  private static instances: Map<string, PerformanceMonitor> = new Map();
  private metrics: Map<string, number[]> = new Map();
  private errors: Map<string, number> = new Map();
  private eventEmitter: EventEmitter;
  private readonly service: string;

  private constructor(service: string) {
    this.service = service;
    this.eventEmitter = new EventEmitter();
    this.setupPeriodicReporting();
  }

  static getInstance(service: string): PerformanceMonitor {
    if (!this.instances.has(service)) {
      this.instances.set(service, new PerformanceMonitor(service));
    }
    return this.instances.get(service)!;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  recordError(type: string, error: Error): void {
    const count = this.errors.get(type) || 0;
    this.errors.set(type, count + 1);
    
    console.error(`[${this.service}] ${type}:`, error);
    this.eventEmitter.emit('error', { type, error });
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};

    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;

      result[name] = {
        avg: values.reduce((a, b) => a + b) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return result;
  }

  getErrors(): Record<string, number> {
    return Object.fromEntries(this.errors);
  }

  onError(callback: (data: { type: string; error: Error }) => void): void {
    this.eventEmitter.on('error', callback);
  }

  private setupPeriodicReporting(): void {
    setInterval(() => {
      const metrics = this.getMetrics();
      const errors = this.getErrors();

      console.log(`[${this.service}] Performance Report:`, {
        metrics,
        errors,
        timestamp: new Date().toISOString(),
      });

      // Reset metrics after reporting
      this.metrics.clear();
      this.errors.clear();
    }, 5 * 60 * 1000); // Report every 5 minutes
  }
} 