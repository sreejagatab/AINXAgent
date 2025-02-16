import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Prompt } from '@enhanced-ai-agent/shared';

interface PromptExecutionDialogProps {
  open: boolean;
  prompt: Prompt;
  onClose: () => void;
  onExecute: (input: string, options: any) => Promise<void>;
}

export const PromptExecutionDialog: React.FC<PromptExecutionDialogProps> = ({
  open,
  prompt,
  onClose,
  onExecute,
}) => {
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [options, setOptions] = useState({
    temperature: prompt.parameters.temperature || 0.7,
    maxTokens: prompt.parameters.maxTokens || 1000,
    stream: false,
  });

  const handleExecute = async () => {
    if (!input.trim()) return;

    setIsExecuting(true);
    try {
      await onExecute(input, options);
      onClose();
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Execute Prompt: {prompt.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {prompt.content}
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle2" gutterBottom>
          Temperature: {options.temperature}
        </Typography>
        <Slider
          value={options.temperature}
          min={0}
          max={2}
          step={0.1}
          onChange={(_, value) =>
            setOptions({ ...options, temperature: value as number })
          }
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" gutterBottom>
          Max Tokens: {options.maxTokens}
        </Typography>
        <Slider
          value={options.maxTokens}
          min={1}
          max={4000}
          step={1}
          onChange={(_, value) =>
            setOptions({ ...options, maxTokens: value as number })
          }
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={options.stream}
              onChange={(e) =>
                setOptions({ ...options, stream: e.target.checked })
              }
            />
          }
          label="Stream Response"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isExecuting}>
          Cancel
        </Button>
        <Button
          onClick={handleExecute}
          variant="contained"
          disabled={!input.trim() || isExecuting}
          startIcon={isExecuting ? <CircularProgress size={20} /> : null}
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 