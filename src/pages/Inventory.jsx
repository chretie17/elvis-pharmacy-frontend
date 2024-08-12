import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import api from '../api'; // Import the configured axios instance

// The types available in your system
const types = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', manufacturer: '', type: '', quantity: '', expiration_date: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      if (response.status === 200 && Array.isArray(response.data)) {
        setInventory(response.data); // Only set if the data is an array
      } else {
        console.error('Unexpected response data:', response.data);
        setSnackbarMessage('Unexpected response format');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setSnackbarMessage('Failed to fetch inventory');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpen = () => {
    setIsEdit(false);
    setFormData({ name: '', manufacturer: '', type: '', quantity: '', expiration_date: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        // Handle edit inventory logic here
        await api.put(`/inventory/${editItemId}`, formData);
        setSnackbarMessage('Inventory item updated successfully!');
      } else {
        // Handle add inventory logic here
        await api.post('/inventory', formData);
        setSnackbarMessage('Inventory item added successfully!');
      }
      setSnackbarSeverity('success');
      fetchInventory();
      handleClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      setSnackbarMessage('An error occurred!');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditItemId(item.id);
    setFormData({ name: item.name, manufacturer: item.manufacturer, type: item.type, quantity: item.quantity, expiration_date: item.expiration_date });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setSnackbarMessage('Inventory item deleted successfully!');
      setSnackbarSeverity('success');
      fetchInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
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
        Add Inventory Item
      </Button>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Expiration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.expiration_date}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(item)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog for Adding/Editing Inventory Items */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            {types.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Expiration Date"
            name="expiration_date"
            value={formData.expiration_date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
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
