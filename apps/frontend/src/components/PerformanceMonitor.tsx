import React, { useEffect } from 'react';
import { usePerformance } from '../hooks/usePerformance';
import { formatDuration, formatBytes } from '../utils/format';
import { Chart } from './Chart';
import { Card } from './Card';
import { Badge } from './Badge';

export const PerformanceMonitor: React.FC = () => {
  const { metrics, measureMemoryUsage, isPerformanceCritical } = usePerformance();

  useEffect(() => {
    const interval = setInterval(measureMemoryUsage, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [measureMemoryUsage]);

  const renderMetricCard = (
    title: string,
    value: number,
    unit: string,
    threshold: number,
    description: string
  ) => (
    <Card className="metric-card">
      <div className="metric-header">
        <h3>{title}</h3>
        <Badge
          variant={value > threshold ? 'danger' : 'success'}
          className="metric-status"
        >
          {value > threshold ? 'Poor' : 'Good'}
        </Badge>
      </div>
      <div className="metric-value">
        {formatDuration(value)}
        <span className="metric-unit">{unit}</span>
      </div>
      <p className="metric-description">{description}</p>
      <Chart
        data={[{ value, threshold }]}
        type="gauge"
        options={{
          min: 0,
          max: threshold * 2,
          threshold,
        }}
      />
    </Card>
  );

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h2>Performance Metrics</h2>
        {isPerformanceCritical() && (
          <Badge variant="warning" className="critical-warning">
            Performance Issues Detected
          </Badge>
        )}
      </div>

      <div className="metrics-grid">
        {renderMetricCard(
          'First Input Delay',
          metrics.firstInputDelay,
          'ms',
          100,
          'Time from first interaction to response'
        )}
        {renderMetricCard(
          'Largest Contentful Paint',
          metrics.largestContentfulPaint,
          'ms',
          2500,
          'Time until largest content element is visible'
        )}
        {renderMetricCard(
          'Cumulative Layout Shift',
          metrics.cumulativeLayoutShift,
          '',
          0.1,
          'Measure of visual stability'
        )}
      </div>

      {metrics.memoryUsage && (
        <Card className="memory-usage">
          <h3>Memory Usage</h3>
          <div className="memory-metrics">
            <div className="memory-metric">
              <span>Used Heap</span>
              <strong>{formatBytes(metrics.memoryUsage.usedJSHeapSize)}</strong>
            </div>
            <div className="memory-metric">
              <span>Total Heap</span>
              <strong>{formatBytes(metrics.memoryUsage.totalJSHeapSize)}</strong>
            </div>
            <div className="memory-metric">
              <span>Heap Limit</span>
              <strong>{formatBytes(metrics.memoryUsage.jsHeapSizeLimit)}</strong>
            </div>
          </div>
          <Chart
            data={[
              {
                used: metrics.memoryUsage.usedJSHeapSize,
                total: metrics.memoryUsage.totalJSHeapSize,
                limit: metrics.memoryUsage.jsHeapSizeLimit,
              },
            ]}
            type="area"
            options={{
              stacked: true,
              height: 200,
            }}
          />
        </Card>
      )}
    </div>
  );
}; 