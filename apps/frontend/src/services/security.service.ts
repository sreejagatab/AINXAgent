import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';
import { storage } from '../utils/storage';
import { getEnvironment } from '../config/environment';
import { store } from '../store';
import { logout } from '../store/slices/auth.slice';

interface SecurityConfig {
  maxTokenAge: number;
  maxInactivityTime: number;
  sensitiveRoutes: string[];
  maxFailedAttempts: number;
  lockoutDuration: number;
}

class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private activityTimeout?: number;
  private failedAttempts: Map<string, number> = new Map();
  private lockoutTimers: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      maxTokenAge: 24 * 60 * 60 * 1000, // 24 hours
      maxInactivityTime: 30 * 60 * 1000, // 30 minutes
      sensitiveRoutes: ['/admin', '/settings', '/billing'],
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };

    this.initializeActivityMonitor();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private initializeActivityMonitor(): void {
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      window.addEventListener(eventType, () => this.resetActivityTimer());
    });
  }

  private resetActivityTimer(): void {
    if (this.activityTimeout) {
      window.clearTimeout(this.activityTimeout);
    }

    this.activityTimeout = window.setTimeout(() => {
      this.handleInactivity();
    }, this.config.maxInactivityTime);
  }

  private handleInactivity(): void {
    logger.warn('User session expired due to inactivity');
    analyticsService.trackEvent('security_inactivity_logout');
    this.forceLogout('Session expired due to inactivity');
  }

  public validateToken(token: string): boolean {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;
      
      if (Date.now() >= expirationTime) {
        this.handleTokenExpiration();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Token validation failed', { error });
      return false;
    }
  }

  public handleFailedLogin(username: string): void {
    const attempts = (this.failedAttempts.get(username) || 0) + 1;
    this.failedAttempts.set(username, attempts);

    if (attempts >= this.config.maxFailedAttempts) {
      this.lockAccount(username);
    }

    analyticsService.trackEvent('security_failed_login', {
      username,
      attempts,
    });
  }

  private lockAccount(username: string): void {
    logger.warn('Account locked due to too many failed attempts', { username });
    
    if (this.lockoutTimers.has(username)) {
      window.clearTimeout(this.lockoutTimers.get(username));
    }

    this.lockoutTimers.set(
      username,
      window.setTimeout(() => {
        this.failedAttempts.delete(username);
        this.lockoutTimers.delete(username);
      }, this.config.lockoutDuration)
    );

    analyticsService.trackEvent('security_account_locked', { username });
  }

  public isAccountLocked(username: string): boolean {
    return this.failedAttempts.get(username) >= this.config.maxFailedAttempts;
  }

  public validateRoute(route: string): boolean {
    const { isAuthenticated, user } = store.getState().auth;
    
    if (this.config.sensitiveRoutes.includes(route)) {
      if (!isAuthenticated) {
        this.handleUnauthorizedAccess(route);
        return false;
      }

      if (route.startsWith('/admin') && user?.role !== 'admin') {
        this.handleUnauthorizedAccess(route);
        return false;
      }
    }

    return true;
  }

  private handleUnauthorizedAccess(route: string): void {
    logger.warn('Unauthorized access attempt', { route });
    analyticsService.trackEvent('security_unauthorized_access', { route });
  }

  private handleTokenExpiration(): void {
    logger.warn('Token expired');
    analyticsService.trackEvent('security_token_expired');
    this.forceLogout('Session expired');
  }

  private forceLogout(reason: string): void {
    store.dispatch(logout());
    storage.clearAll();
    window.location.href = `/login?reason=${encodeURIComponent(reason)}`;
  }

  public cleanup(): void {
    if (this.activityTimeout) {
      window.clearTimeout(this.activityTimeout);
    }
    this.lockoutTimers.forEach(timerId => window.clearTimeout(timerId));
    this.failedAttempts.clear();
    this.lockoutTimers.clear();
  }
}

export const securityService = SecurityService.getInstance(); 