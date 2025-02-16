import { useState, useCallback, useEffect } from 'react';
import { validationService } from '../services/validation.service';
import { logger } from '../utils/logger';
import type { ValidationSchema } from '../types/form.types';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!validationSchema || !validationSchema[name]) return [];

      return validationService.validateField(value, validationSchema[name]);
    },
    [validationSchema]
  );

  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    const validationResult = validationService.validate(values, validationSchema);
    setErrors(validationResult.errors);
    setIsValid(validationResult.isValid);
    return validationResult.isValid;
  }, [values, validationSchema]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;
      const newValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;

      setValues(prev => ({
        ...prev,
        [name]: newValue,
      }));

      if (validateOnChange) {
        const fieldErrors = validateField(name, newValue);
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors,
        }));
      }
    },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = event.target;

      setTouched(prev => ({
        ...prev,
        [name]: true,
      }));

      if (validateOnBlur) {
        const fieldErrors = validateField(name, values[name]);
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors,
        }));
      }
    },
    [validateOnBlur, validateField, values]
  );

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      const isFormValid = validateForm();
      if (!isFormValid || !onSubmit) return;

      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        logger.error('Form submission failed', { error, values });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
    setTouched,
  };
} 