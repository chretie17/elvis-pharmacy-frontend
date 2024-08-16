import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import api from '../Api'; // Import the configured axios instance

const roles = ['Admin', 'Pharmacist', 'Inventory Manager'];

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
        // Update the users state directly
        setUsers(prevUsers => 
          prevUsers.map(user => user.id === editUserId ? { ...user, ...formData } : user)
        );
      } else {
        const response = await api.post('/users', formData);
        setSnackbarMessage('User added successfully!');
        // Add the new user to the users state
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
      // Remove the deleted user from the users state
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
    <div style={{ padding: '20px' }}>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Add User
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(user)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(user.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog for Adding/Editing Users */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
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
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">{isEdit ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
