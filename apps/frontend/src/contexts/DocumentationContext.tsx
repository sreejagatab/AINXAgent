import React, { createContext, useContext } from 'react';
import { useDocumentation } from '../hooks/useDocumentation';
import type { DocContextType } from '../types/documentation.types';

const DocumentationContext = createContext<DocContextType | undefined>(undefined);

export const DocumentationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const documentationState = useDocumentation();

  return (
    <DocumentationContext.Provider value={documentationState}>
      {children}
    </DocumentationContext.Provider>
  );
};

export const useDocumentationContext = () => {
  const context = useContext(DocumentationContext);
  if (context === undefined) {
    throw new Error('useDocumentationContext must be used within a DocumentationProvider');
  }
  return context;
}; 