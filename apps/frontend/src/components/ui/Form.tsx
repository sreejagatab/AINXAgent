import { createContext, forwardRef, useContext, useId } from 'react';
import { cn } from '../../utils/cn';

interface FormContextValue {
  id: string;
  error?: string;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  error?: string;
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, error, ...props }, ref) => {
    const id = useId();

    return (
      <FormContext.Provider value={{ id, error }}>
        <form
          ref={ref}
          className={cn('space-y-6', className)}
          {...props}
        />
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  description?: string;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, label, error, description }, ref) => {
    const { id } = useContext(FormContext) || {};
    const fieldId = id ? `${id}-field` : undefined;

    return (
      <div ref={ref} className="space-y-2">
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        {children}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { Form, FormField }; 