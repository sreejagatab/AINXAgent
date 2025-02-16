import React, { memo } from 'react';
import { useFormContext } from '../contexts/FormContext';
import type { FormField as FormFieldType } from '../types/form.types';

interface FormFieldProps extends FormFieldType {
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = memo(({
  name,
  label,
  type,
  placeholder,
  required,
  disabled,
  options,
  className,
}) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
  } = useFormContext();

  const hasError = touched[name] && errors[name]?.length > 0;
  const fieldId = `field-${name}`;

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={fieldId}
            name={name}
            value={values[name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`form-select ${hasError ? 'is-invalid' : ''} ${className || ''}`}
            aria-describedby={hasError ? `${fieldId}-error` : undefined}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            name={name}
            value={values[name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-textarea ${hasError ? 'is-invalid' : ''} ${className || ''}`}
            aria-describedby={hasError ? `${fieldId}-error` : undefined}
          />
        );

      case 'checkbox':
        return (
          <input
            id={fieldId}
            type="checkbox"
            name={name}
            checked={values[name] || false}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`form-checkbox ${hasError ? 'is-invalid' : ''} ${className || ''}`}
            aria-describedby={hasError ? `${fieldId}-error` : undefined}
          />
        );

      default:
        return (
          <input
            id={fieldId}
            type={type}
            name={name}
            value={values[name] || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`form-input ${hasError ? 'is-invalid' : ''} ${className || ''}`}
            aria-describedby={hasError ? `${fieldId}-error` : undefined}
          />
        );
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {renderField()}
      {hasError && (
        <div id={`${fieldId}-error`} className="invalid-feedback" role="alert">
          {errors[name]?.join(', ')}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField'; 