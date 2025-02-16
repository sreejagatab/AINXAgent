import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'small';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const theme = useTheme();
  const isSmall = variant === 'small';

  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isSmall ? 1 : 2,
        }}
      >
        <img
          src="/logo.svg"
          alt="Enhanced AI Agent"
          style={{
            width: isSmall ? 32 : 48,
            height: 'auto',
          }}
        />
        <Typography
          variant={isSmall ? 'h6' : 'h5'}
          component="span"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: { xs: isSmall ? 'none' : 'block', sm: 'block' },
          }}
        >
          Enhanced AI Agent
        </Typography>
      </Box>
    </Link>
  );
}; 