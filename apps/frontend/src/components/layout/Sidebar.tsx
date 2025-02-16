import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Code,
  History,
  Settings,
  Analytics,
  API,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Prompts', icon: <Code />, path: '/prompts' },
  { text: 'History', icon: <History />, path: '/history' },
  { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
  { text: 'API Keys', icon: <API />, path: '/api-keys' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <img
          src="/logo.svg"
          alt="Logo"
          style={{ width: 150, height: 'auto' }}
        />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.contrastText,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: location.pathname === item.path
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}; 