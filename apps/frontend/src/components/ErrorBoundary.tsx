import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Here you could send the error to an error reporting service
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="primary"
              >
                Reload page
              </Button>
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="secondary"
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 