import React, { createContext, useContext } from 'react';
import { useForm } from '../hooks/useForm';
import type { FormContextType, FormConfig } from '../types/form.types';

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps extends FormConfig {
  children: React.ReactNode;
  initialValues?: Record<string, any>;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  fields,
  validationSchema,
  onSubmit,
  initialValues = {},
}) => {
  const formState = useForm({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <FormContext.Provider value={formState}>
      <form onSubmit={formState.handleSubmit} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}; 