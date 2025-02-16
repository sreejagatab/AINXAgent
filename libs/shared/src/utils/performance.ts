import { METRICS } from '../constants';

export class PerformanceMonitor {
  private static instances: Map<string, PerformanceMonitor> = new Map();
  private metrics: Map<string, number[]> = new Map();
  private errors: Map<string, Error[]> = new Map();
  private startTime: number;

  private constructor(private readonly name: string) {
    this.startTime = Date.now();
  }

  static getInstance(name: string): PerformanceMonitor {
    if (!this.instances.has(name)) {
      this.instances.set(name, new PerformanceMonitor(name));
    }
    return this.instances.get(name)!;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  recordError(category: string, error: Error): void {
    if (!this.errors.has(category)) {
      this.errors.set(category, []);
    }
    this.errors.get(category)!.push(error);
  }

  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    this.metrics.forEach((values, name) => {
      const count = values.length;
      summary[name] = {
        avg: values.reduce((a, b) => a + b, 0) / count,
        min: Math.min(...values),
        max: Math.max(...values),
        count,
      };
    });

    return summary;
  }

  getErrorRate(): number {
    const totalErrors = Array.from(this.errors.values()).reduce(
      (sum, errors) => sum + errors.length,
      0
    );
    const totalOperations = Array.from(this.metrics.values()).reduce(
      (sum, metrics) => sum + metrics.length,
      0
    );

    return totalOperations === 0 ? 0 : totalErrors / totalOperations;
  }

  isHealthy(): boolean {
    const metrics = this.getMetricsSummary();
    const errorRate = this.getErrorRate();

    return (
      errorRate <= METRICS.ERROR_THRESHOLD &&
      (metrics.latency?.avg ?? 0) <= METRICS.LATENCY_THRESHOLD
    );
  }

  reset(): void {
    this.metrics.clear();
    this.errors.clear();
    this.startTime = Date.now();
  }
} 