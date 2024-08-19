import React, { useContext, useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box, Badge, Divider, List, ListItem, ListItemText, Tooltip } from '@mui/material';
import { Notifications, Logout, CheckCircle } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { deepPurple } from '@mui/material/colors';
import avatarImage from '../assets/man.png'; // Custom avatar from assets folder
import api from '../api'; // Importing your API instance

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notification => !notification.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications(); // Refresh the notification list after marking as read
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <AppBar position="fixed" sx={{ zIndex: 1000, backgroundColor: '#004d40', width: '100%' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={handleNotificationsClick} sx={{ position: 'relative' }}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar
              sx={{ bgcolor: deepPurple[500] }}
              alt={user?.name}
              src={avatarImage} // Use the imported custom avatar
            >
              {user?.name?.[0]}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: '45px' }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={logout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            sx={{ mt: '45px' }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
              <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>Notifications</Typography>
              <Divider />
              <List>
                {notifications.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No notifications" />
                  </ListItem>
                ) : (
                  notifications.map((notification) => (
                    <ListItem 
                      key={notification.id} 
                      button 
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        handleNotificationsClose();
                      }}
                      sx={{ backgroundColor: notification.is_read ? 'transparent' : '#f5f5f5' }}
                    >
                      <ListItemText primary={notification.message} />
                      {!notification.is_read && (
                        <Tooltip title="Mark as read">
                          <IconButton 
                            edge="end" 
                            aria-label="mark as read" 
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(notification.id);
                            }}
                          >
                            <CheckCircle color="success" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
