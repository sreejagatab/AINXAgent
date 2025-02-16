import { useState, useCallback, useEffect } from 'react';
import { backupService } from '../services/backup.service';
import { logger } from '../utils/logger';
import { useToast } from './useToast';

interface BackupInfo {
  timestamp: string;
  version: string;
  size: number;
}

export function useBackup() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backupList = await backupService.getBackups();
      setBackups(backupList.map(backup => ({
        timestamp: backup.timestamp,
        version: backup.version,
        size: JSON.stringify(backup.data).length,
      })));
    } catch (error) {
      const message = 'Failed to load backups';
      logger.error(message, { error });
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const createBackup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await backupService.createBackup();
      await loadBackups();
      showToast({ type: 'success', message: 'Backup created successfully' });
    } catch (error) {
      const message = 'Failed to create backup';
      logger.error(message, { error });
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [loadBackups, showToast]);

  const restoreBackup = useCallback(async (timestamp: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await backupService.restoreBackup(timestamp);
      showToast({ type: 'success', message: 'Backup restored successfully' });
    } catch (error) {
      const message = 'Failed to restore backup';
      logger.error(message, { error });
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  return {
    backups,
    isLoading,
    error,
    createBackup,
    restoreBackup,
    refreshBackups: loadBackups,
  };
} 