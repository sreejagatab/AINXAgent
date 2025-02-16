export interface ValidationRule {
  validate: (value: any, ...args: any[]) => boolean;
  message: string | ((...args: any[]) => string);
}

export interface ValidationSchema {
  [field: string]: {
    rules: (ValidationRule | string)[];
    required?: boolean;
    transform?: (value: any) => any;
  };
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  validate?: ValidationRule[];
  transform?: (value: any) => any;
}

export interface FormConfig {
  fields: FormField[];
  validationSchema?: ValidationSchema;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  resetLabel?: string;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormActions<T = Record<string, any>> {
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
  reset: () => void;
  setValues: (values: T) => void;
  setErrors: (errors: Record<string, string[]>) => void;
  setTouched: (touched: Record<string, boolean>) => void;
}

export type FormContextType<T = Record<string, any>> = FormState<T> & FormActions<T>; 