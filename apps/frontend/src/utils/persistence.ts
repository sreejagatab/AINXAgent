import { logger } from './logger';
import { storage } from './storage';

export async function clearAllPersistedData(): Promise<void> {
  try {
    await storage.clear();
    logger.info('All persisted data cleared');
  } catch (error) {
    logger.error('Failed to clear all persisted data', { error });
    throw error;
  }
}

export async function getStorageUsage(): Promise<{
  used: number;
  quota: number;
  percentage: number;
}> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.usage && estimate.quota
          ? (estimate.usage / estimate.quota) * 100
          : 0,
      };
    }
    return { used: 0, quota: 0, percentage: 0 };
  } catch (error) {
    logger.error('Failed to get storage usage', { error });
    return { used: 0, quota: 0, percentage: 0 };
  }
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

export async function migrateStorage(migrations: Array<{
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => Promise<any>;
}>): Promise<void> {
  try {
    for (const migration of migrations) {
      const keys = await storage.keys();
      for (const key of keys) {
        const data = await storage.getItem(key);
        if (data && data.version === migration.fromVersion) {
          const migratedData = await migration.migrate(data.data);
          await storage.setItem(key, {
            ...data,
            data: migratedData,
            version: migration.toVersion,
          });
          logger.info('Storage migration completed', {
            key,
            fromVersion: migration.fromVersion,
            toVersion: migration.toVersion,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Storage migration failed', { error });
    throw error;
  }
} 