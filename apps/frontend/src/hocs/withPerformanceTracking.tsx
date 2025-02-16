import React, { ComponentType } from 'react';
import { usePerformance } from '../hooks/usePerformance';
import { analyticsService } from '../services/analytics.service';

interface WithPerformanceTrackingProps {
  componentName?: string;
}

export function withPerformanceTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPerformanceTrackingProps = {}
) {
  const WithPerformanceTracking: React.FC<P> = (props) => {
    const componentName = options.componentName || WrappedComponent.displayName || WrappedComponent.name;
    const { measureAsync, measure } = usePerformance(componentName);

    // Track component render
    React.useEffect(() => {
      analyticsService.trackEvent('component_render', {
        componentName,
        timestamp: new Date().toISOString(),
      });
    });

    // Enhance component with performance measuring utilities
    const enhancedProps = {
      ...props,
      measureAsync,
      measure,
    };

    return <WrappedComponent {...enhancedProps} />;
  };

  WithPerformanceTracking.displayName = `WithPerformanceTracking(${componentName})`;

  return WithPerformanceTracking;
} 