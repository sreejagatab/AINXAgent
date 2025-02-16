export type SecurityViolation = {
  type: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: SecuritySeverity;
  source: SecuritySource;
};

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecuritySource = 
  | 'input_validation'
  | 'token_validation'
  | 'csp_violation'
  | 'runtime_error'
  | 'api_error'
  | 'authentication'
  | 'authorization';

export type SecurityConfig = {
  maxViolations: number;
  violationResetTime: number;
  cspDirectives: Record<string, string[]>;
  allowedDomains: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
};

export type SecurityContext = {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
};

export type SecurityMetrics = {
  violations: number;
  blockedRequests: number;
  suspiciousActivities: number;
  timestamp: Date;
  period: 'hour' | 'day' | 'week' | 'month';
};

export type SecurityReport = {
  id: string;
  violations: SecurityViolation[];
  metrics: SecurityMetrics;
  recommendations: string[];
  timestamp: Date;
};

export interface SecurityService {
  validateInput(input: string, context: string): boolean;
  validateToken(token: string): boolean;
  handleViolation(violation: SecurityViolation): void;
  generateReport(): SecurityReport;
}

export interface SecurityHook {
  validateInput: (input: string, context: string) => boolean;
  validateToken: (token: string) => boolean;
  validatePermission: (permission: string) => boolean;
  validateRole: (role: string | string[]) => boolean;
  sanitizeContent: (content: string, options?: {
    allowHtml?: boolean;
    allowLinks?: boolean;
  }) => string;
} 