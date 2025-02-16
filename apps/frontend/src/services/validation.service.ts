import { logger } from '../utils/logger';
import { analyticsService } from './analytics.service';

interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

interface ValidationSchema {
  [field: string]: {
    rules: ValidationRule[];
    required?: boolean;
    transform?: (value: any) => any;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  fields: Record<string, boolean>;
}

class ValidationService {
  private static instance: ValidationService;
  private customRules: Map<string, ValidationRule> = new Map();

  private constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  private initializeDefaultRules(): void {
    this.addRule('required', {
      validate: (value) => value !== undefined && value !== null && value !== '',
      message: 'This field is required',
    });

    this.addRule('email', {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address',
    });

    this.addRule('minLength', {
      validate: (value, min) => String(value).length >= min,
      message: (min) => `Must be at least ${min} characters`,
    });

    this.addRule('maxLength', {
      validate: (value, max) => String(value).length <= max,
      message: (max) => `Must not exceed ${max} characters`,
    });

    this.addRule('pattern', {
      validate: (value, pattern) => new RegExp(pattern).test(value),
      message: 'Invalid format',
    });
  }

  public addRule(name: string, rule: ValidationRule): void {
    this.customRules.set(name, rule);
  }

  public validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: {},
      fields: {},
    };

    Object.entries(schema).forEach(([field, fieldSchema]) => {
      const value = fieldSchema.transform ? 
        fieldSchema.transform(data[field]) : 
        data[field];

      const fieldErrors: string[] = [];

      if (fieldSchema.required && !this.customRules.get('required')?.validate(value)) {
        fieldErrors.push('This field is required');
      }

      fieldSchema.rules.forEach(rule => {
        if (!rule.validate(value)) {
          fieldErrors.push(rule.message);
        }
      });

      if (fieldErrors.length > 0) {
        result.isValid = false;
        result.errors[field] = fieldErrors;
        result.fields[field] = false;
      } else {
        result.fields[field] = true;
      }
    });

    if (!result.isValid) {
      logger.debug('Validation failed', {
        errors: result.errors,
        data,
      });

      analyticsService.trackEvent('form_validation_failed', {
        errors: Object.keys(result.errors),
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  }

  public createSchema(schema: ValidationSchema): ValidationSchema {
    return Object.entries(schema).reduce((acc, [field, fieldSchema]) => {
      acc[field] = {
        ...fieldSchema,
        rules: fieldSchema.rules.map(rule => {
          if (typeof rule === 'string') {
            const predefinedRule = this.customRules.get(rule);
            if (!predefinedRule) {
              throw new Error(`Validation rule '${rule}' not found`);
            }
            return predefinedRule;
          }
          return rule;
        }),
      };
      return acc;
    }, {} as ValidationSchema);
  }

  public validateField(
    value: any,
    fieldSchema: ValidationSchema[string]
  ): string[] {
    const errors: string[] = [];

    if (fieldSchema.required && !this.customRules.get('required')?.validate(value)) {
      errors.push('This field is required');
    }

    fieldSchema.rules.forEach(rule => {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    });

    return errors;
  }
}

export const validationService = ValidationService.getInstance(); 