import { Middleware } from '@reduxjs/toolkit';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { getEnvironment } from '../config/environment';

export const securityMiddleware: Middleware = () => (next) => (action) => {
  // Check for security-related actions
  if (action.type.startsWith('auth/')) {
    // Log security events
    logger.info('Security Event', {
      type: action.type,
      timestamp: new Date().toISOString(),
      userId: storage.getItem('userId'),
    });

    // Handle token expiration
    if (action.type === 'auth/tokenExpired') {
      storage.clearAll();
      window.location.href = '/login';
      return;
    }

    // Handle security violations
    if (action.type === 'auth/securityViolation') {
      logger.error('Security Violation', {
        ...action.payload,
        userId: storage.getItem('userId'),
      });
      storage.clearAll();
      window.location.href = '/login';
      return;
    }
  }

  // Check for sensitive data in non-production environments
  if (!getEnvironment().isProduction) {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /credit.*card/i,
      /ssn/i,
    ];

    const actionString = JSON.stringify(action);
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(actionString)) {
        logger.warn('Sensitive data detected in action', {
          type: action.type,
          pattern: pattern.toString(),
        });
      }
    });
  }

  return next(action);
}; 