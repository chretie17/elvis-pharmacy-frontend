import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Dashboard, People, Inventory, LocalPharmacy, Assignment, AccountBalance, Gavel, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Patients', icon: <LocalPharmacy />, path: '/patients' },
    { text: 'Pharmacists', icon: <Assignment />, path: '/pharmacists' },
    { text: 'Financial Records', icon: <AccountBalance />, path: '/financial' },
    { text: 'Compliance', icon: <Gavel />, path: '/compliance' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a', // Dark sidebar background
          color: '#ffffff', // White text color
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem button key={index} onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
