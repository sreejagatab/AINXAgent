import React from 'react';
import { Card, Box, Typography, useTheme } from '@mui/material';
import {
  Code as PromptsIcon,
  Api as ApiIcon,
  CheckCircle as SuccessIcon,
  Timer as TimeIcon,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  icon: 'prompts' | 'api' | 'success' | 'time';
  trendDirection?: 'up' | 'down';
}

const icons = {
  prompts: PromptsIcon,
  api: ApiIcon,
  success: SuccessIcon,
  time: TimeIcon,
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  icon,
  trendDirection = 'up',
}) => {
  const theme = useTheme();
  const Icon = icons[icon];
  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trendDirection === 'up' ? 'success.main' : 'error.main';

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
            mr: 2,
          }}
        >
          <Icon />
        </Box>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>

      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TrendIcon sx={{ color: trendColor, mr: 0.5 }} fontSize="small" />
        <Typography variant="body2" sx={{ color: trendColor }}>
          {trend}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
          vs last month
        </Typography>
      </Box>
    </Card>
  );
}; 