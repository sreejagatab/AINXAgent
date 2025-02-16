import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { Logo } from '../common/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 2,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Logo />
        </Box>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <a href="/terms" target="_blank" rel="noopener">
            Terms
          </a>
          <a href="/privacy" target="_blank" rel="noopener">
            Privacy
          </a>
          <a href="/contact" target="_blank" rel="noopener">
            Contact
          </a>
        </Box>
        © {new Date().getFullYear()} Enhanced AI Agent. All rights reserved.
      </Box>
    </Box>
  );
}; 