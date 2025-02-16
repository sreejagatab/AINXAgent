import React from 'react';
import styles from './ErrorFallback.module.css';

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Something went wrong</h1>
        
        <div className={styles.details}>
          {error && (
            <>
              <p className={styles.message}>{error.message}</p>
              {process.env.NODE_ENV === 'development' && (
                <pre className={styles.stack}>{error.stack}</pre>
              )}
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => window.location.reload()}
            className={styles.button}
          >
            Refresh Page
          </button>
          <button
            onClick={resetError}
            className={`${styles.button} ${styles.secondary}`}
          >
            Try Again
          </button>
        </div>

        <p className={styles.help}>
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  );
}; 