import React from 'react';
import { Grid, Box } from '@mui/material';
import { StatsCard } from '../components/dashboard/StatsCard';
import { RecentPrompts } from '../components/dashboard/RecentPrompts';
import { UsageChart } from '../components/dashboard/UsageChart';
import { PromptMetrics } from '../components/dashboard/PromptMetrics';
import { useAppSelector } from '../store';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { loading } = useAppSelector((state) => state.prompts);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Prompts"
            value="156"
            trend="+12%"
            icon="prompts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="API Calls"
            value="2,345"
            trend="+23%"
            icon="api"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Success Rate"
            value="98.5%"
            trend="+1.2%"
            icon="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Response Time"
            value="245ms"
            trend="-18%"
            icon="time"
            trendDirection="down"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <UsageChart />
        </Grid>
        <Grid item xs={12} md={4}>
          <PromptMetrics />
        </Grid>

        <Grid item xs={12}>
          <RecentPrompts />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 