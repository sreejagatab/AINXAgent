import React from 'react';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../types/error.types';
import { errorService } from '../../services/error.service';
import { ErrorFallback } from './ErrorFallback';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorService.captureError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
} 