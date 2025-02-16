import React from 'react';
import { Card, Box, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: '2024-01', apiCalls: 1200, prompts: 85 },
  { date: '2024-02', apiCalls: 1850, prompts: 120 },
  { date: '2024-03', apiCalls: 2345, prompts: 156 },
];

export const UsageChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Usage Trends
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Line
              type="monotone"
              dataKey="apiCalls"
              stroke={theme.palette.primary.main}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="prompts"
              stroke={theme.palette.secondary.main}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}; 