import React, { useState } from 'react';
import { useBackup } from '../hooks/useBackup';
import { formatDate } from '../utils/date';
import { formatBytes } from '../utils/format';
import { Modal } from './Modal';
import { Button } from './Button';
import { Spinner } from './Spinner';

export const BackupManager: React.FC = () => {
  const { backups, isLoading, error, createBackup, restoreBackup } = useBackup();
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  const handleRestore = async () => {
    if (selectedBackup) {
      await restoreBackup(selectedBackup);
      setShowRestoreModal(false);
      setSelectedBackup(null);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="backup-manager">
      <div className="backup-header">
        <h2>Backup Manager</h2>
        <Button
          onClick={createBackup}
          disabled={isLoading}
          variant="primary"
        >
          Create Backup
        </Button>
      </div>

      <div className="backup-list">
        {backups.length === 0 ? (
          <p>No backups available</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Version</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => (
                <tr key={backup.timestamp}>
                  <td>{formatDate(backup.timestamp)}</td>
                  <td>{backup.version}</td>
                  <td>{formatBytes(backup.size)}</td>
                  <td>
                    <Button
                      onClick={() => {
                        setSelectedBackup(backup.timestamp);
                        setShowRestoreModal(true);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Restore Backup"
      >
        <div className="modal-body">
          <p>Are you sure you want to restore this backup? This action cannot be undone.</p>
          <p>The application will reload after the restore is complete.</p>
        </div>
        <div className="modal-footer">
          <Button
            onClick={() => setShowRestoreModal(false)}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            variant="danger"
          >
            Restore
          </Button>
        </div>
      </Modal>
    </div>
  );
}; 