import React from 'react';
import { Card, Box, Typography, LinearProgress, useTheme } from '@mui/material';

interface MetricProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, total, color }) => {
  const progress = (value / total) * 100;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body2" color="textPrimary">
          {value} / {total}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
    </Box>
  );
};

export const PromptMetrics: React.FC = () => {
  const theme = useTheme();

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Prompt Metrics
      </Typography>

      <Metric
        label="Successful Executions"
        value={142}
        total={156}
        color={theme.palette.success.main}
      />

      <Metric
        label="API Usage"
        value={2345}
        total={5000}
        color={theme.palette.primary.main}
      />

      <Metric
        label="Storage Used"
        value={256}
        total={1024}
        color={theme.palette.secondary.main}
      />
    </Card>
  );
}; 