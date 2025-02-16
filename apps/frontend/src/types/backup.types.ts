export interface BackupData {
  timestamp: string;
  version: string;
  data: Record<string, any>;
  checksum: string;
}

export interface BackupConfig {
  autoBackupInterval: number;
  maxBackups: number;
  encryptionKey?: string;
  compressionEnabled: boolean;
}

export interface BackupInfo {
  timestamp: string;
  version: string;
  size: number;
}

export interface BackupService {
  startAutoBackup(): void;
  stopAutoBackup(): void;
  createBackup(): Promise<void>;
  restoreBackup(timestamp: string): Promise<void>;
  getBackups(): Promise<BackupData[]>;
}

export interface BackupState {
  backups: BackupInfo[];
  isLoading: boolean;
  error: string | null;
}

export interface BackupActions {
  createBackup: () => Promise<void>;
  restoreBackup: (timestamp: string) => Promise<void>;
  refreshBackups: () => Promise<void>;
}

export type BackupContextType = BackupState & BackupActions;

export interface BackupProviderProps {
  children: React.ReactNode;
  config?: Partial<BackupConfig>;
} 