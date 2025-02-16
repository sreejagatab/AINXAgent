import React, { Component, ErrorInfo } from 'react';
import { errorService } from '../services/error.service';
import { Button } from './Button';
import { logger } from '../utils/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    errorService.handleError(error, {
      componentStack: errorInfo.componentStack,
      ...this.getErrorContext(),
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    logger.error('React error boundary caught error', {
      error,
      errorInfo,
      context: this.getErrorContext(),
    });
  }

  private getErrorContext(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReportError = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    if (error) {
      await errorService.handleError(error, {
        componentStack: errorInfo?.componentStack,
        reported: true,
        ...this.getErrorContext(),
      });
    }
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="error-boundary">
        <div className="error-content">
          <h1>Something went wrong</h1>
          <p>We apologize for the inconvenience. Please try again or contact support if the problem persists.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="error-details">
              <h3>Error Details:</h3>
              <pre>{error?.toString()}</pre>
              {errorInfo && (
                <>
                  <h3>Component Stack:</h3>
                  <pre>{errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          )}

          <div className="error-actions">
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
            <Button onClick={this.handleReportError} variant="secondary">
              Report Error
            </Button>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
} 