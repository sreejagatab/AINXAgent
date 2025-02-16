import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../store';
import { executePrompt } from '../../store/slices/promptsSlice';
import { useNotification } from '../../hooks/useNotification';
import { CodeEditor } from '../common/CodeEditor';

interface PromptPreviewProps {
  promptId: string;
  template: string;
  parameters: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  promptId,
  template,
  parameters,
}) => {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const [result, setResult] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const schema = z.object({
    ...parameters.reduce((acc, param) => ({
      ...acc,
      [param.name]: param.required ? z.string().min(1) : z.string(),
    }), {}),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const handleExecute = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await dispatch(executePrompt({
        promptId,
        input: data,
      })).unwrap();
      setResult(response.output);
      showNotification('Prompt executed successfully', 'success');
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Template
          </Typography>
          <CodeEditor
            value={template}
            onChange={() => {}}
            height="150px"
            language="markdown"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" gutterBottom>
          Parameters
        </Typography>
        <form onSubmit={handleSubmit(handleExecute)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {parameters.map((param) => (
              <Controller
                key={param.name}
                name={param.name}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={param.name}
                    helperText={errors[param.name]?.message as string || param.description}
                    error={!!errors[param.name]}
                    fullWidth
                  />
                )}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            type="submit"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            Execute
          </Button>
        </form>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Result
            </Typography>
            <CodeEditor
              value={result}
              onChange={() => {}}
              height="200px"
              language="markdown"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 