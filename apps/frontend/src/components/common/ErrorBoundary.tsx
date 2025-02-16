import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import * as Sentry from '@sentry/react';
import { analytics } from '../../utils/analytics';
import { logger } from '../../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });

    // Log to analytics
    analytics.exception(error.message, true);

    // Log to console in development
    logger.error('UI Error', {
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <ErrorOutline color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but something went wrong. Please try again or contact support if the problem
              persists.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              Reload Page
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Error Details:
                </Typography>
                <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
} 