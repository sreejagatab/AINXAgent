import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { analyticsService } from './analytics.service';
import { encryptionService } from './encryption.service';

interface PersistenceConfig {
  key: string;
  version: string;
  encrypt?: boolean;
  compress?: boolean;
  expiry?: number;
}

interface PersistedData<T> {
  data: T;
  version: string;
  timestamp: number;
  checksum: string;
}

class PersistenceService {
  private static instance: PersistenceService;
  private cache: Map<string, any> = new Map();
  private migrations: Map<string, (data: any) => any> = new Map();

  private constructor() {}

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  public async persist<T>(data: T, config: PersistenceConfig): Promise<void> {
    try {
      let processedData = data;

      if (config.encrypt) {
        processedData = await encryptionService.encrypt(data);
      }

      const persistedData: PersistedData<T> = {
        data: processedData,
        version: config.version,
        timestamp: Date.now(),
        checksum: this.generateChecksum(processedData),
      };

      await storage.setItem(config.key, JSON.stringify(persistedData));
      this.cache.set(config.key, data);

      analyticsService.trackEvent('state_persisted', {
        key: config.key,
        version: config.version,
      });
    } catch (error) {
      logger.error('Failed to persist data', { error, key: config.key });
      throw error;
    }
  }

  public async retrieve<T>(config: PersistenceConfig): Promise<T | null> {
    try {
      // Check cache first
      if (this.cache.has(config.key)) {
        return this.cache.get(config.key);
      }

      const rawData = await storage.getItem(config.key);
      if (!rawData) return null;

      const persistedData: PersistedData<T> = JSON.parse(rawData);

      // Validate data
      if (!this.validateChecksum(persistedData.data, persistedData.checksum)) {
        throw new Error('Data integrity check failed');
      }

      // Check expiry
      if (config.expiry && Date.now() - persistedData.timestamp > config.expiry) {
        await this.remove(config.key);
        return null;
      }

      // Handle version migrations
      let data = persistedData.data;
      if (persistedData.version !== config.version) {
        data = await this.migrate(data, persistedData.version, config.version);
      }

      // Decrypt if necessary
      if (config.encrypt) {
        data = await encryptionService.decrypt(data);
      }

      this.cache.set(config.key, data);
      return data;
    } catch (error) {
      logger.error('Failed to retrieve data', { error, key: config.key });
      return null;
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      await storage.removeItem(key);
      this.cache.delete(key);
    } catch (error) {
      logger.error('Failed to remove data', { error, key });
      throw error;
    }
  }

  public registerMigration(fromVersion: string, toVersion: string, migrationFn: (data: any) => any): void {
    const migrationKey = `${fromVersion}->${toVersion}`;
    this.migrations.set(migrationKey, migrationFn);
  }

  private async migrate(data: any, fromVersion: string, toVersion: string): Promise<any> {
    const migrationKey = `${fromVersion}->${toVersion}`;
    const migration = this.migrations.get(migrationKey);

    if (!migration) {
      throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`);
    }

    try {
      const migratedData = await migration(data);
      analyticsService.trackEvent('state_migration_completed', {
        fromVersion,
        toVersion,
      });
      return migratedData;
    } catch (error) {
      logger.error('Migration failed', { error, fromVersion, toVersion });
      throw error;
    }
  }

  private generateChecksum(data: any): string {
    return Array.from(
      new Uint8Array(
        new TextEncoder().encode(JSON.stringify(data)).buffer
      )
    ).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private validateChecksum(data: any, checksum: string): boolean {
    return this.generateChecksum(data) === checksum;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const persistenceService = PersistenceService.getInstance(); 