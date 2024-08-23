import React, { useContext, useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Collapse, 
  IconButton, 
  Typography 
} from '@mui/material';
import { 
  Dashboard, 
  People, 
  Inventory, 
  LocalPharmacy, 
  Assignment, 
  AccountBalance, 
  Gavel, 
  ShoppingCart, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { styled, useTheme } from '@mui/material/styles';
import logo from '../assets/pharamcy.jpg';

const drawerWidth = 280;

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: open ? drawerWidth : theme.spacing(9),
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    '& .MuiDrawer-paper': {
      width: open ? drawerWidth : theme.spacing(9),
      backgroundColor: '#004d40',
      color: '#ffffff',
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  })
);

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: '#ffffff',
  minWidth: theme.spacing(5),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
}));

const Logo = styled('img')(({ theme }) => ({
  width: theme.spacing(7),
  height: theme.spacing(7),
  margin: theme.spacing(2, 'auto'),
  borderRadius: '50%',
  border: '2px solid #ffffff',
  padding: theme.spacing(1),
  backgroundColor: '#ffffff',
}));

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(true);

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
    <StyledDrawer variant="permanent" open={open}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: theme.spacing(2) }}>
        <Logo src={logo} />
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, color: '#ffffff' }}>
            Pharma Insight
          </Typography>
        </Collapse>
      </Box>
      <IconButton
        onClick={handleToggle}
        sx={{
          alignSelf: 'flex-end',
          mr: 1,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
      <List>
        {menuItems.map((item, index) => (
          <StyledListItem
            button
            key={index}
            onClick={() => navigate(item.path)}
            active={location.pathname === item.path}
          >
            <StyledListItemIcon>
              {item.icon}
            </StyledListItemIcon>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <StyledListItemText primary={item.text} />
            </Collapse>
          </StyledListItem>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
