import React, { useContext, useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, IconButton } from '@mui/material';
import { Dashboard, People, Inventory, LocalPharmacy, Assignment, AccountBalance, Gavel, ShoppingCart, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { styled } from '@mui/system';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(true); // For collapsing the sidebar

  const handleToggle = () => {
    setOpen(!open);
  };

  const commonMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  ];

  const adminMenuItems = [
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Patients', icon: <LocalPharmacy />, path: '/patients' },
    { text: 'Pharmacists', icon: <Assignment />, path: '/pharmacists' },
    { text: 'Financial Reports', icon: <AccountBalance />, path: '/financial' },
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
        width: open ? 240 : 70,
        flexShrink: 0,
        zIndex: 1200,
        overflowX: 'hidden',
        transition: 'width 0.3s ease-in-out',
        [`& .MuiDrawer-paper`]: {
          width: open ? 240 : 70,
          boxSizing: 'border-box',
          backgroundColor: '#004d40',
          color: '#ffffff',
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <IconButton onClick={handleToggle} sx={{ color: '#ffffff', margin: '10px' }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
        <List>
          {menuItems.map((item, index) => (
            <ListItem 
              button 
              key={index} 
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: '#00695c',
                  transition: 'background-color 0.2s ease-in-out',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff', minWidth: open ? 40 : 70 }}>
                {item.icon}
              </ListItemIcon>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap' 
                    } 
                  }} 
                />
              </Collapse>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
