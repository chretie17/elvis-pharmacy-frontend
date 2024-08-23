import React, { useContext, useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box, Badge, List, ListItem, ListItemText, Tooltip, Fade } from '@mui/material';
import { Notifications, Logout, CheckCircle, AccessTime } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import avatarImage from '../assets/man.png';
import api from '../api';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#004d40',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const StyledToolbar = styled(Toolbar)({
  justifyContent: 'space-between',
  padding: '0 24px',
});

const UserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: '#ffffff',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4.5),
  height: theme.spacing(4.5),
  border: '2px solid #ffffff',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: '#ffffff',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
    borderRadius: theme.shape.borderRadius,
  },
}));

const NotificationList = styled(List)({
  maxHeight: '400px',
  overflowY: 'auto',
  width: '320px',
});

const NotificationItem = styled(ListItem)(({ theme, isRead }) => ({
  backgroundColor: isRead ? 'transparent' : 'rgba(0, 77, 64, 0.08)',
  borderLeft: isRead ? 'none' : '4px solid #004d40',
  '&:hover': {
    backgroundColor: 'rgba(0, 77, 64, 0.12)',
  },
}));

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: '#ffffff' }}>
      <AccessTime sx={{ mr: 1 }} />
      {time.toLocaleTimeString()}
    </Typography>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotificationsClick = (event) => setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);

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
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
        </Typography>

        <LiveClock />

        <UserInfo>
          <StyledIconButton onClick={handleNotificationsClick}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </StyledIconButton>

          <Tooltip title="Logout" arrow>
            <StyledIconButton onClick={logout} sx={{ ml: 2 }}>
              <Logout />
            </StyledIconButton>
          </Tooltip>

          <StyledAvatar alt={user?.name} src={avatarImage} sx={{ ml: 2 }}>
            {user?.name?.[0]}
          </StyledAvatar>

          <StyledMenu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={Fade}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004d40', mb: 1 }}>
                Notifications
              </Typography>
              <NotificationList>
                {notifications.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No notifications" />
                  </ListItem>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      button 
                      isRead={notification.is_read}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <ListItemText 
                        primary={notification.message} 
                        secondary={new Date(notification.created_at).toLocaleString()}
                      />
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
                    </NotificationItem>
                  ))
                )}
              </NotificationList>
            </Box>
          </StyledMenu>
        </UserInfo>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;