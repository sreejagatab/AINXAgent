import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SxProps,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { debounce } from 'lodash';

interface PromptFiltersProps {
  filters: {
    type: string;
    status: string;
    search: string;
  };
  onChange: (filters: any) => void;
  sx?: SxProps<Theme>;
}

export const PromptFilters: React.FC<PromptFiltersProps> = ({
  filters,
  onChange,
  sx,
}) => {
  const handleSearchChange = debounce((value: string) => {
    onChange({ ...filters, search: value });
  }, 300);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        ...sx,
      }}
    >
      <TextField
        label="Search prompts"
        variant="outlined"
        size="small"
        defaultValue={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ minWidth: 200 }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={filters.type}
          label="Type"
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="completion">Completion</MenuItem>
          <MenuItem value="chat">Chat</MenuItem>
          <MenuItem value="edit">Edit</MenuItem>
          <MenuItem value="image">Image</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}; 