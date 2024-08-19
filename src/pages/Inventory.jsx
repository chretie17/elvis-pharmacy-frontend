import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert, Typography, Box
} from '@mui/material';
import { styled } from '@mui/system';
import api from '../api'; // Import the configured axios instance

// The types available in your system
const types = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'];

const Container = styled(Box)(({ theme }) => ({
  padding: theme?.spacing(3) || '24px',
  backgroundColor: '#ffffff', // White background
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '900px',
  marginTop: theme?.spacing(3) || '24px',
  padding: theme?.spacing(2) || '16px',
  boxShadow: theme?.shadows?.[3] || '0px 1px 3px rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
  backgroundColor: '#e8f5e9', // Light green background for Paper
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4CAF50', // Pharmacy green
  color: '#fff',
  '&:hover': {
    backgroundColor: '#388E3C', // Darker green on hover
  },
  marginBottom: theme?.spacing(2) || '16px',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#333', // Dark text
  fontWeight: 'bold',
}));

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', manufacturer: '', type: '', quantity: '', expiration_date: '', price: '',
    age_allowed_min: '', age_allowed_max: '', usage_instructions: '', side_effects: '', contraindications: ''
  });
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
        setInventory(response.data);
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
    setFormData({
      name: '', manufacturer: '', type: '', quantity: '', expiration_date: '', price: '',
      age_allowed_min: '', age_allowed_max: '', usage_instructions: '', side_effects: '', contraindications: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await api.put(`/inventory/${editItemId}`, formData);
        setSnackbarMessage('Inventory item updated successfully!');
      } else {
        await api.post('/inventory', formData);
        setSnackbarMessage('Inventory item added successfully!');
      }
      setSnackbarSeverity('success');
      fetchInventory(); // Refresh the inventory list
      handleClose(); // Close the dialog
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
    setFormData({
      name: item.name,
      manufacturer: item.manufacturer,
      type: item.type,
      quantity: item.quantity,
      expiration_date: item.expiration_date.split('T')[0], // Trim the time portion
      price: item.price,
      age_allowed_min: item.age_allowed_min || '',
      age_allowed_max: item.age_allowed_max || '',
      usage_instructions: item.usage_instructions || '',
      side_effects: item.side_effects || '',
      contraindications: item.contraindications || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setSnackbarMessage('Inventory item deleted successfully!');
      setSnackbarSeverity('success');
      fetchInventory(); // Refresh the inventory list
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
    <Container>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Manage Inventory
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen}>
        Add Inventory Item
      </StyledButton>
      <StyledPaper>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Manufacturer</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Quantity</StyledTableCell>
              <StyledTableCell>Expiration Date</StyledTableCell>
              <StyledTableCell>Price (RWF)</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
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
                <TableCell>{item.expiration_date.split('T')[0]}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(item)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledPaper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
          <TextField
            label="Price (RWF)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Min Age Allowed"
            name="age_allowed_min"
            value={formData.age_allowed_min}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Max Age Allowed"
            name="age_allowed_max"
            value={formData.age_allowed_max}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Usage Instructions"
            name="usage_instructions"
            value={formData.usage_instructions}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Side Effects"
            name="side_effects"
            value={formData.side_effects}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Contraindications"
            name="contraindications"
            value={formData.contraindications}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
