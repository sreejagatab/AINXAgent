import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { usePreferences } from '../../hooks/usePreferences';

export const UserPreferences: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const [isLoading, setIsLoading] = React.useState(false);
  const [localPreferences, setLocalPreferences] = React.useState(preferences || {});

  const handleChange = (key: string, value: any) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await updatePreferences(localPreferences);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          User Preferences
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.emailNotifications}
                  onChange={(e) =>
                    handleChange('emailNotifications', e.target.checked)
                  }
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.pushNotifications}
                  onChange={(e) =>
                    handleChange('pushNotifications', e.target.checked)
                  }
                />
              }
              label="Push Notifications"
            />
          </FormGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Display Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={localPreferences.theme}
                  label="Theme"
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={localPreferences.language}
                  label="Language"
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Save Preferences
          </LoadingButton>
        </Box>
      </CardContent>
    </Card>
  );
}; 