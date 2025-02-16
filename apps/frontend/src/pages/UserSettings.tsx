import React from 'react';
import { Container, Grid, Box, Tab, Tabs } from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';
import { UserProfile } from '../components/user/UserProfile';
import { UserPreferences } from '../components/user/UserPreferences';
import { ChangePassword } from '../components/user/ChangePassword';
import { DeleteAccount } from '../components/user/DeleteAccount';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const UserSettings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = React.useState('1');

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Account Settings"
        description="Manage your account settings and preferences"
      />

      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="settings tabs"
            >
              <Tab label="Profile" value="1" />
              <Tab label="Preferences" value="2" />
              <Tab label="Security" value="3" />
            </Tabs>
          </Box>

          <TabPanel value="1">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <UserProfile />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value="2">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <UserPreferences />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value="3">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChangePassword />
              </Grid>
              <Grid item xs={12}>
                <DeleteAccount />
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </Box>
    </Container>
  );
}; 