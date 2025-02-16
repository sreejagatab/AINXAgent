import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { promptSchema, PromptType, PromptStatus } from '@enhanced-ai-agent/shared';
import { CodeEditor } from '../common/CodeEditor';
import { useNotification } from '../../hooks/useNotification';

interface PromptFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { showNotification } = useNotification();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(promptSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      type: 'completion',
      template: '',
      status: 'draft',
      parameters: [],
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        reset();
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message as string}
                    margin="normal"
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message as string}
                    margin="normal"
                  />
                )}
              />

              <Controller
                name="template"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Prompt Template
                    </Typography>
                    <CodeEditor
                      value={field.value}
                      onChange={field.onChange}
                      language="markdown"
                      error={!!errors.template}
                      helperText={errors.template?.message as string}
                    />
                  </Box>
                )}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>

              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      {Object.values(PromptType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.type && (
                      <FormHelperText>{errors.type.message as string}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {Object.values(PromptStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message as string}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={isLoading}
                  fullWidth
                >
                  Reset
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                  fullWidth
                >
                  {initialData ? 'Update' : 'Create'}
                </LoadingButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
}; 