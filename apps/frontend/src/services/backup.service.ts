import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { analyticsService } from './analytics.service';
import { getEnvironment } from '../config/environment';

interface BackupData {
  timestamp: string;
  version: string;
  data: Record<string, any>;
  checksum: string;
}

interface BackupConfig {
  autoBackupInterval: number;
  maxBackups: number;
  encryptionKey?: string;
  compressionEnabled: boolean;
}

class BackupService {
  private static instance: BackupService;
  private config: BackupConfig;
  private backupInterval?: number;
  private readonly BACKUP_KEY = 'app_state_backup';

  private constructor() {
    this.config = {
      autoBackupInterval: 5 * 60 * 1000, // 5 minutes
      maxBackups: 5,
      compressionEnabled: true,
    };
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  public startAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = window.setInterval(() => {
      this.createBackup()
        .then(() => logger.debug('Auto backup completed'))
        .catch(error => logger.error('Auto backup failed', { error }));
    }, this.config.autoBackupInterval);
  }

  public stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = undefined;
    }
  }

  public async createBackup(): Promise<void> {
    try {
      const state = this.collectState();
      const backup: BackupData = {
        timestamp: new Date().toISOString(),
        version: getEnvironment().APP_VERSION,
        data: state,
        checksum: this.generateChecksum(state),
      };

      const backups = await this.getBackups();
      backups.unshift(backup);

      // Keep only the most recent backups
      while (backups.length > this.config.maxBackups) {
        backups.pop();
      }

      const compressedBackups = this.config.compressionEnabled
        ? await this.compressData(backups)
        : backups;

      await storage.setItem(this.BACKUP_KEY, compressedBackups);

      analyticsService.trackEvent('backup_created', {
        timestamp: backup.timestamp,
        size: JSON.stringify(backup).length,
      });
    } catch (error) {
      logger.error('Failed to create backup', { error });
      throw error;
    }
  }

  public async restoreBackup(timestamp: string): Promise<void> {
    try {
      const backups = await this.getBackups();
      const backup = backups.find(b => b.timestamp === timestamp);

      if (!backup) {
        throw new Error('Backup not found');
      }

      if (!this.validateChecksum(backup.data, backup.checksum)) {
        throw new Error('Backup checksum validation failed');
      }

      await this.applyBackup(backup.data);

      analyticsService.trackEvent('backup_restored', {
        timestamp: backup.timestamp,
        version: backup.version,
      });
    } catch (error) {
      logger.error('Failed to restore backup', { error });
      throw error;
    }
  }

  private async getBackups(): Promise<BackupData[]> {
    const backups = await storage.getItem(this.BACKUP_KEY) || [];
    return this.config.compressionEnabled
      ? await this.decompressData(backups)
      : backups;
  }

  private collectState(): Record<string, any> {
    return {
      // Collect relevant application state
      preferences: storage.getItem('user_preferences'),
      settings: storage.getItem('app_settings'),
      cache: storage.getItem('app_cache'),
      // Add other state as needed
    };
  }

  private async applyBackup(data: Record<string, any>): Promise<void> {
    // Apply the backup data to restore application state
    Object.entries(data).forEach(([key, value]) => {
      storage.setItem(key, value);
    });

    // Trigger application reload to apply restored state
    window.location.reload();
  }

  private generateChecksum(data: any): string {
    // Implement checksum generation (e.g., using SHA-256)
    return Array.from(
      new Uint8Array(
        new TextEncoder().encode(JSON.stringify(data)).buffer
      )
    ).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private validateChecksum(data: any, checksum: string): boolean {
    return this.generateChecksum(data) === checksum;
  }

  private async compressData<T>(data: T): Promise<string> {
    // Implement data compression (e.g., using CompressionStream)
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const compressedBlob = await new Response(
      blob.stream().pipeThrough(new CompressionStream('gzip'))
    ).blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedBlob);
    });
  }

  private async decompressData<T>(compressedData: string): Promise<T> {
    // Implement data decompression
    const blob = await fetch(compressedData).then(res => res.blob());
    const decompressedBlob = await new Response(
      blob.stream().pipeThrough(new DecompressionStream('gzip'))
    ).blob();
    const text = await decompressedBlob.text();
    return JSON.parse(text);
  }
}

export const backupService = BackupService.getInstance(); 