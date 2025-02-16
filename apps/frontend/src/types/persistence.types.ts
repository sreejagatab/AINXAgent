export interface PersistenceConfig {
  key: string;
  version: string;
  encrypt?: boolean;
  compress?: boolean;
  expiry?: number;
}

export interface PersistedData<T> {
  data: T;
  version: string;
  timestamp: number;
  checksum: string;
}

export interface PersistenceState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

export interface PersistenceActions<T> {
  setData: (data: T) => Promise<void>;
  clearData: () => Promise<void>;
}

export interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: (data: any) => Promise<any>;
}

export interface PersistenceService {
  persist<T>(data: T, config: PersistenceConfig): Promise<void>;
  retrieve<T>(config: PersistenceConfig): Promise<T | null>;
  remove(key: string): Promise<void>;
  registerMigration(fromVersion: string, toVersion: string, migrationFn: (data: any) => any): void;
  clearCache(): void;
}

export type PersistenceContextType<T> = PersistenceState<T> & PersistenceActions<T>; 