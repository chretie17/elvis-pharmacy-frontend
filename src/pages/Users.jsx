import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert, Typography, Box, IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import api from '../Api';

const roles = ['Admin', 'Pharmacist', 'Inventory Manager'];

const Container = styled(Box)(({ theme }) => ({
  padding: theme?.spacing(3) || '24px',
  backgroundColor: '#e0f2f1', // Light teal background
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1000px',
  marginTop: theme?.spacing(3) || '24px',
  padding: theme?.spacing(3) || '24px',
  boxShadow: '0 8px 32px rgba(0, 77, 64, 0.1)',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#004d40',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#00695c',
  },
  marginBottom: theme?.spacing(2) || '16px',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px rgba(0, 77, 64, 0.1)',
  transition: 'all 0.3s ease',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#004d40',
  fontWeight: 'bold',
  borderBottom: '2px solid #004d40',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#e0f2f1',
  },
  '&:hover': {
    backgroundColor: '#b2dfdb',
  },
  transition: 'background-color 0.3s ease',
}));

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      if (response.status === 200 && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Unexpected response data:', response.data);
        setSnackbarMessage('Unexpected response format');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbarMessage('Failed to fetch users');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpen = () => {
    setIsEdit(false);
    setFormData({ username: '', email: '', password: '', role: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await api.put(`/users/${editUserId}`, formData);
        setSnackbarMessage('User updated successfully!');
        setUsers(prevUsers =>
          prevUsers.map(user => user.id === editUserId ? { ...user, ...formData } : user)
        );
      } else {
        const response = await api.post('/users', formData);
        setSnackbarMessage('User added successfully!');
        setUsers(prevUsers => [...prevUsers, response.data]);
      }
      setSnackbarSeverity('success');
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbarMessage('An error occurred!');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (user) => {
    setIsEdit(true);
    setEditUserId(user.id);
    setFormData({ username: user.username, email: user.email, role: user.role });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setSnackbarMessage('User deleted successfully!');
      setSnackbarSeverity('success');
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbarMessage('An error occurred!');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom color="#004d40" fontWeight="bold" textAlign="center">
        Manage Users
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen} startIcon={<AddCircleIcon />}>
        Add New User
      </StyledButton>
      <StyledPaper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Username</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleEdit(user)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(user.id)}
                    color="secondary"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledPaper>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '16px',
            backgroundColor: '#e0f2f1',
          }
        }}
      >
        <DialogTitle sx={{ color: '#004d40', fontWeight: 'bold' }}>
          {isEdit ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#004d40',
                },
                '&:hover fieldset': {
                  borderColor: '#00695c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#004d40',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#004d40',
              },
            }}
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#004d40',
                },
                '&:hover fieldset': {
                  borderColor: '#00695c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#004d40',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#004d40',
              },
            }}
          />
          {!isEdit && (
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#004d40',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00695c',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#004d40',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#004d40',
                },
              }}
            />
          )}
          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#004d40',
                },
                '&:hover fieldset': {
                  borderColor: '#00695c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#004d40',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#004d40',
              },
            }}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#004d40' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            sx={{ 
              backgroundColor: '#004d40',
              '&:hover': {
                backgroundColor: '#00695c',
              }
            }}
          >
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            backgroundColor: '#004d40',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}