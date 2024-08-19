import React, { useContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Dashboard, People, Inventory, LocalPharmacy, Assignment, AccountBalance, Gavel, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const commonMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  ];

  const adminMenuItems = [
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Patients', icon: <LocalPharmacy />, path: '/patients' },
    { text: 'Pharmacists', icon: <Assignment />, path: '/pharmacists' },
    { text: 'Financial Records', icon: <AccountBalance />, path: '/financial' },
    { text: 'Compliance', icon: <Gavel />, path: '/compliance' },
  ];

  const inventoryManagerMenuItems = [
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Compliance', icon: <Gavel />, path: '/compliance' },
  ];

  const pharmacistMenuItems = [
    { text: 'Patients', icon: <LocalPharmacy />, path: '/patients' },
    { text: 'Compliance', icon: <Gavel />, path: '/compliance' },
  ];

  let menuItems = [...commonMenuItems];

  if (user?.role === 'Admin') {
    menuItems = [...menuItems, ...adminMenuItems];
  } else if (user?.role === 'Inventory Manager') {
    menuItems = [...menuItems, ...inventoryManagerMenuItems];
  } else if (user?.role === 'Pharmacist') {
    menuItems = [...menuItems, ...pharmacistMenuItems];
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        zIndex: 1200,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#00695c', // Use a pharmacy-themed green color
          color: '#ffffff',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem button key={index} onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontWeight: 'bold' } }} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
