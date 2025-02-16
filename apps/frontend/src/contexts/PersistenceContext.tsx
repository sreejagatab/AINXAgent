import React, { createContext, useContext } from 'react';
import { usePersistence } from '../hooks/usePersistence';
import type { PersistenceContextType, PersistenceConfig } from '../types/persistence.types';

interface PersistenceProviderProps<T> {
  children: React.ReactNode;
  storageKey: string;
  initialData: T;
  config?: Partial<PersistenceConfig>;
}

const PersistenceContext = createContext<PersistenceContextType<any> | undefined>(undefined);

export function PersistenceProvider<T>({
  children,
  storageKey,
  initialData,
  config,
}: PersistenceProviderProps<T>) {
  const persistenceState = usePersistence<T>(storageKey, initialData, config);

  return (
    <PersistenceContext.Provider value={persistenceState}>
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistenceContext<T>() {
  const context = useContext(PersistenceContext);
  if (context === undefined) {
    throw new Error('usePersistenceContext must be used within a PersistenceProvider');
  }
  return context as PersistenceContextType<T>;
} 