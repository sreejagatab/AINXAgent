import React, { createContext, useContext, useEffect } from 'react';
import { backupService } from '../services/backup.service';
import { useBackup } from '../hooks/useBackup';
import type { BackupContextType, BackupProviderProps } from '../types/backup.types';

const BackupContext = createContext<BackupContextType | undefined>(undefined);

export const BackupProvider: React.FC<BackupProviderProps> = ({
  children,
  config,
}) => {
  const backupState = useBackup();

  useEffect(() => {
    if (config) {
      // Configure backup service
      Object.entries(config).forEach(([key, value]) => {
        (backupService as any)[key] = value;
      });
    }

    // Start auto backup
    backupService.startAutoBackup();

    return () => {
      backupService.stopAutoBackup();
    };
  }, [config]);

  return (
    <BackupContext.Provider value={backupState}>
      {children}
    </BackupContext.Provider>
  );
};

export const useBackupContext = () => {
  const context = useContext(BackupContext);
  if (context === undefined) {
    throw new Error('useBackupContext must be used within a BackupProvider');
  }
  return context;
}; 