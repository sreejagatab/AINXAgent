import { Gauge, Counter, Histogram } from 'prom-client';
import { createLogger, format, transports } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { PerformanceMonitor } from './performance.monitor';

export class MonitoringService {
  private static instance: MonitoringService;
  private logger: any;
  private metrics: {
    requestDuration: Histogram;
    requestTotal: Counter;
    errorTotal: Counter;
    activeConnections: Gauge;
    memoryUsage: Gauge;
    cpuUsage: Gauge;
  };

  private constructor() {
    this.initializeLogger();
    this.initializeMetrics();
    this.startMetricsCollection();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeLogger() {
    const esTransport = new ElasticsearchTransport({
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: {
          username: process.env.ELASTICSEARCH_USER || 'elastic',
          password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
        },
      },
      indexPrefix: 'enhanced-ai-agent-logs',
    });

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
      ),
      defaultMeta: { service: 'enhanced-ai-agent' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          ),
        }),
        esTransport,
      ],
    });
  }

  private initializeMetrics() {
    this.metrics = {
      requestDuration: new Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route', 'status'],
        buckets: [0.1, 0.5, 1, 2, 5],
      }),

      requestTotal: new Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status'],
      }),

      errorTotal: new Counter({
        name: 'error_total',
        help: 'Total number of errors',
        labelNames: ['type', 'message'],
      }),

      activeConnections: new Gauge({
        name: 'active_connections',
        help: 'Number of active WebSocket connections',
      }),

      memoryUsage: new Gauge({
        name: 'memory_usage_bytes',
        help: 'Memory usage in bytes',
      }),

      cpuUsage: new Gauge({
        name: 'cpu_usage_percentage',
        help: 'CPU usage percentage',
      }),
    };
  }

  private startMetricsCollection() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage.set(memUsage.heapUsed);

      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const totalUsage = (endUsage.user + endUsage.system) / 1000000;
        this.metrics.cpuUsage.set(totalUsage);
      }, 100);
    }, 5000);
  }

  logInfo(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  logError(message: string, error: Error, meta?: any) {
    this.logger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
      },
      ...meta,
    });
    this.metrics.errorTotal.inc({
      type: error.name,
      message: error.message,
    });
  }

  logWarning(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  recordRequestMetrics(method: string, route: string, status: number, duration: number) {
    this.metrics.requestDuration.observe(
      { method, route, status },
      duration / 1000
    );
    this.metrics.requestTotal.inc({ method, route, status });
  }

  updateActiveConnections(count: number) {
    this.metrics.activeConnections.set(count);
  }

  getMetrics() {
    return this.metrics;
  }
} 