import { useCallback } from 'react';
import { securityService } from '../services/security.service';
import { useAuth } from './useAuth';

export const useSecurity = () => {
  const { user } = useAuth();

  const validateInput = useCallback((
    input: string,
    context: string
  ): boolean => {
    return securityService.validateInput(input, context);
  }, []);

  const validateToken = useCallback((token: string): boolean => {
    return securityService.validateToken(token);
  }, []);

  const validatePermission = useCallback((
    permission: string
  ): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const validateRole = useCallback((
    requiredRole: string | string[]
  ): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) 
      ? requiredRole 
      : [requiredRole];
      
    return roles.includes(user.role);
  }, [user]);

  const sanitizeContent = useCallback((
    content: string,
    options?: {
      allowHtml?: boolean;
      allowLinks?: boolean;
    }
  ): string => {
    let sanitized = content;

    if (!options?.allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    if (!options?.allowLinks) {
      sanitized = sanitized.replace(/https?:\/\/\S+/g, '[LINK REMOVED]');
    }

    return sanitized;
  }, []);

  return {
    validateInput,
    validateToken,
    validatePermission,
    validateRole,
    sanitizeContent,
  };
}; 