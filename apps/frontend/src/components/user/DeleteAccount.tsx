import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';

export const DeleteAccount: React.FC = () => {
  const { deleteAccount } = useProfile();
  const { logout } = useAuth();
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount(password);
      await logout();
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <Card sx={{ bgcolor: 'error.light' }}>
      <CardContent>
        <Typography variant="h6" color="error" gutterBottom>
          Delete Account
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => setDialogOpen(true)}
          >
            Delete Account
          </Button>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To confirm deletion, please enter your password. This action cannot
              be undone.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              onClick={handleDelete}
              loading={isLoading}
              color="error"
              variant="contained"
              disabled={!password}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}; 