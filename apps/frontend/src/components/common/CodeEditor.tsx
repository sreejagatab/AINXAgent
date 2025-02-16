import React from 'react';
import Editor from '@monaco-editor/react';
import { Box, Typography, useTheme } from '@mui/material';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string | number;
  error?: boolean;
  helperText?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'markdown',
  height = '300px',
  error = false,
  helperText,
}) => {
  const theme = useTheme();

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'textSecondary'}
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}; 