export interface PerformanceMetrics {
  timeToFirstByte: number;
  timeToFirstPaint: number;
  timeToFirstContentfulPaint: number;
  timeToInteractive: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  resourceLoadTimes: Record<string, number>;
  memoryUsage?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

export interface PerformanceThresholds {
  timeToFirstByte: number;
  timeToFirstPaint: number;
  timeToFirstContentfulPaint: number;
  timeToInteractive: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  startTime: number;
  initiatorType: string;
  transferSize?: number;
  decodedBodySize?: number;
  encodedBodySize?: number;
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  isLoading: boolean;
  error: string | null;
}

export interface PerformanceActions {
  measureMemoryUsage: () => Promise<void>;
  getResourceLoadTime: (resourceUrl: string) => number;
  isPerformanceCritical: () => boolean;
}

export type PerformanceContextType = PerformanceState & PerformanceActions; 