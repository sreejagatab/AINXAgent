import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Collapse,
  TextField,
  Button,
} from '@mui/material';
import {
  PlayArrow as ExecuteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { Prompt } from '@enhanced-ai-agent/shared';
import { useTheme } from '@mui/material/styles';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useNotification } from '../../hooks/useNotification';

interface PromptCardProps {
  prompt: Prompt;
  onExecute: (input: string) => Promise<void>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onExecute,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExecute = async () => {
    if (!input.trim()) {
      showNotification('Please enter input for the prompt', 'warning');
      return;
    }

    setIsExecuting(true);
    try {
      await onExecute(input);
      setInput('');
      setExpanded(false);
      showNotification('Prompt executed successfully', 'success');
    } catch (error) {
      showNotification('Failed to execute prompt', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(prompt.id);
      showNotification('Prompt deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete prompt', 'error');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card
        elevation={2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {prompt.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {prompt.content}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {prompt.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
            <IconButton onClick={() => onEdit(prompt.id)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setShowDeleteConfirm(true)}>
              <DeleteIcon />
            </IconButton>
          </Box>
          <Chip
            label={prompt.model}
            size="small"
            color="primary"
            variant="outlined"
          />
        </CardActions>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Enter your input..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<ExecuteIcon />}
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </Box>
        </Collapse>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Prompt"
        content="Are you sure you want to delete this prompt? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}; 