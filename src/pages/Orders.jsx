import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Typography, Box
} from '@mui/material';
import { styled } from '@mui/system';
import api from '../api'; // Import the configured axios instance

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ inventory_name: '', order_quantity: '', order_date: '', status: '' });
  const [isEdit, setIsEdit] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      if (response.status === 200 && Array.isArray(response.data)) {
        setOrders(response.data);
        showSnackbar('Orders fetched successfully!', 'success');
      } else {
        showSnackbar('Unexpected response format', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to fetch orders', 'error');
      console.error('Error fetching orders:', error);
    }
  };

  const handleOpen = () => {
    setIsEdit(false);
    setFormData({ inventory_name: '', order_quantity: '', order_date: '', status: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await api.put(`/orders/${editOrderId}`, formData);
        showSnackbar('Order updated successfully!', 'success');
      } else {
        await api.post('/orders', formData);
        showSnackbar('Order created successfully!', 'success');
      }
      fetchOrders(); // Refresh the orders list
      handleClose(); // Close the dialog
    } catch (error) {
      showSnackbar('An error occurred while saving the order', 'error');
      console.error('Error saving order:', error);
    }
  };

  const handleEdit = (order) => {
    setIsEdit(true);
    setEditOrderId(order.id);
    setFormData({
      inventory_name: order.inventory_name,
      order_quantity: order.order_quantity,
      order_date: order.order_date.split('T')[0], // Trim the time portion
      status: order.status
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      showSnackbar('Order deleted successfully!', 'success');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      showSnackbar('An error occurred while deleting the order', 'error');
      console.error('Error deleting order:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Manage Orders
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen}>
        Add Order
      </StyledButton>
      <StyledPaper>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Order ID</StyledTableCell>
              <StyledTableCell>Inventory Name</StyledTableCell>
              <StyledTableCell>Order Quantity</StyledTableCell>
              <StyledTableCell>Order Date</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.inventory_name}</TableCell>
                <TableCell>{order.order_quantity}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(order)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(order.id)}
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
        <DialogTitle>{isEdit ? 'Edit Order' : 'Add Order'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Inventory Name"
            name="inventory_name"
            value={formData.inventory_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Order Quantity"
            name="order_quantity"
            value={formData.order_quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Order Date"
            name="order_date"
            value={formData.order_date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            margin="normal"
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
