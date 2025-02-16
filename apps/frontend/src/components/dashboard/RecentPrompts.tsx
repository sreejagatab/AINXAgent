import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import { Edit, PlayArrow, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { deletePrompt } from '../../store/slices/promptsSlice';
import { setModalState } from '../../store/slices/uiSlice';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '../../hooks/useNotification';

export const RecentPrompts: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const [selectedPromptId, setSelectedPromptId] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  
  const prompts = useAppSelector((state) => state.prompts.items.slice(0, 5));

  const handleExecute = (promptId: string) => {
    dispatch(setModalState({ modal: 'executePrompt', open: true }));
    navigate(`/prompts/${promptId}/execute`);
  };

  const handleEdit = (promptId: string) => {
    navigate(`/prompts/${promptId}/edit`);
  };

  const handleDelete = async (promptId: string) => {
    try {
      await dispatch(deletePrompt(promptId)).unwrap();
      showNotification('Prompt deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete prompt', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      draft: 'warning',
      archived: 'error',
    } as const;
    return colors[status as keyof typeof colors] || 'default';
  };

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Prompts
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Used</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id} hover>
                  <TableCell>{prompt.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={prompt.type}
                      size="small"
                      sx={{ backgroundColor: theme.palette.primary.light }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prompt.status}
                      size="small"
                      color={getStatusColor(prompt.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(prompt.lastUsed), { addSuffix: true })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleExecute(prompt.id)}
                      title="Execute"
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(prompt.id)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPromptId(prompt.id);
                        setConfirmOpen(true);
                      }}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Prompt"
        content="Are you sure you want to delete this prompt? This action cannot be undone."
        onConfirm={() => {
          if (selectedPromptId) {
            handleDelete(selectedPromptId);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}; 