import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { PromptCard } from './PromptCard';
import { PromptFilters } from './PromptFilters';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { usePromptService } from '../../hooks/usePromptService';
import { Prompt } from '@enhanced-ai-agent/shared';
import { QUERY_KEYS } from '../../constants/queryKeys';

export const PromptList: React.FC = () => {
  const theme = useTheme();
  const promptService = usePromptService();
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'active',
    search: '',
  });

  const {
    data: prompts,
    isLoading,
    error,
    refetch,
  } = useQuery(
    [QUERY_KEYS.PROMPTS, filters],
    () => promptService.getPrompts(filters),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={refetch} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Prompts
      </Typography>

      <PromptFilters
        filters={filters}
        onChange={setFilters}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {prompts?.map((prompt: Prompt) => (
          <Grid item xs={12} sm={6} md={4} key={prompt.id}>
            <PromptCard
              prompt={prompt}
              onExecute={(input) => promptService.executePrompt(prompt.id, input)}
              onEdit={(id) => promptService.updatePrompt(id, prompt)}
              onDelete={(id) => promptService.deletePrompt(id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 