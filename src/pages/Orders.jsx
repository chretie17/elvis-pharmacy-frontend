import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Typography, Box, IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import api from '../Api';

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
      <Typography variant="h3" gutterBottom color="#004d40" fontWeight="bold" textAlign="center">
        Manage Orders
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen} startIcon={<AddCircleIcon />}>
        Add New Order
      </StyledButton>
      <StyledPaper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Order ID</StyledTableCell>
              <StyledTableCell>Inventory Name</StyledTableCell>
              <StyledTableCell>Order Quantity</StyledTableCell>
              <StyledTableCell>Order Date</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <StyledTableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.inventory_name}</TableCell>
                <TableCell>{order.order_quantity}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleEdit(order)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(order.id)}
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
          {isEdit ? 'Edit Order' : 'Add New Order'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Inventory Name"
            name="inventory_name"
            value={formData.inventory_name}
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
            label="Order Quantity"
            name="order_quantity"
            value={formData.order_quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
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
            label="Status"
            name="status"
            value={formData.status}
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