import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';
import { performanceService } from './performance.service';
import { getEnvironment } from '../config/environment';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: boolean;
    storage: boolean;
    network: boolean;
    memory: boolean;
  };
  metrics: {
    memory: number;
    loadTime: number;
    apiLatency: number;
  };
}

class HealthService {
  private static instance: HealthService;
  private checkInterval: number = 30000; // 30 seconds
  private intervalId?: number;

  private constructor() {}

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  public startMonitoring(): void {
    this.checkHealth();
    this.intervalId = window.setInterval(() => this.checkHealth(), this.checkInterval);
  }

  public stopMonitoring(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  private async checkHealth(): Promise<HealthStatus> {
    const startTime = performance.now();
    
    const checks = {
      api: await this.checkApiHealth(),
      storage: this.checkStorageHealth(),
      network: await this.checkNetworkHealth(),
      memory: this.checkMemoryHealth(),
    };

    const metrics = {
      memory: this.getMemoryUsage(),
      loadTime: performance.now() - startTime,
      apiLatency: await this.measureApiLatency(),
    };

    const status = this.determineOverallStatus(checks);

    const healthStatus: HealthStatus = {
      status,
      checks,
      metrics,
    };

    this.reportHealth(healthStatus);
    return healthStatus;
  }

  private async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${getEnvironment().API_URL}/health`);
      return response.status === 200;
    } catch (error) {
      logger.error('API health check failed', { error });
      return false;
    }
  }

  private checkStorageHealth(): boolean {
    try {
      localStorage.setItem('health_check', 'test');
      localStorage.removeItem('health_check');
      return true;
    } catch (error) {
      logger.error('Storage health check failed', { error });
      return false;
    }
  }

  private async checkNetworkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      logger.error('Network health check failed', { error });
      return false;
    }
  }

  private checkMemoryHealth(): boolean {
    const memoryUsage = this.getMemoryUsage();
    return memoryUsage < 90; // Alert if memory usage is above 90%
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  private async measureApiLatency(): Promise<number> {
    return performanceService.measureAsync('api-latency', async () => {
      try {
        const response = await fetch(`${getEnvironment().API_URL}/ping`);
        return response.ok ? 1 : 0;
      } catch {
        return 0;
      }
    });
  }

  private determineOverallStatus(checks: HealthStatus['checks']): HealthStatus['status'] {
    const failedChecks = Object.values(checks).filter(check => !check).length;
    
    if (failedChecks === 0) return 'healthy';
    if (failedChecks <= 2) return 'degraded';
    return 'unhealthy';
  }

  private reportHealth(status: HealthStatus): void {
    logger.info('Health check completed', status);

    if (status.status !== 'healthy') {
      analyticsService.trackEvent('health_degraded', {
        status: status.status,
        failedChecks: Object.entries(status.checks)
          .filter(([, value]) => !value)
          .map(([key]) => key),
        metrics: status.metrics,
      });
    }

    // Track metrics
    Object.entries(status.metrics).forEach(([metric, value]) => {
      analyticsService.trackTiming('Health', metric, value);
    });
  }
}

export const healthService = HealthService.getInstance(); 