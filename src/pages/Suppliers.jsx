import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Typography, Box, IconButton, Fade
} from '@mui/material';
import { styled } from '@mui/system';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import api from '../Api';

const Container = styled(Box)(({ theme }) => ({
  padding: theme?.spacing(3) || '24px',
  backgroundColor: '#e0f2f1', 
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

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      if (response.status === 200 && Array.isArray(response.data)) {
        setSuppliers(response.data);
        showSnackbar('Suppliers fetched successfully!', 'success');
      } else {
        showSnackbar('Unexpected response format', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to fetch suppliers', 'error');
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleOpen = () => {
    setIsEdit(false);
    setFormData({ name: '', email: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await api.put(`/suppliers/${editSupplierId}`, formData);
        showSnackbar('Supplier updated successfully!', 'success');
      } else {
        await api.post('/suppliers', formData);
        showSnackbar('Supplier added successfully!', 'success');
      }
      fetchSuppliers();
      handleClose();
    } catch (error) {
      showSnackbar('An error occurred while saving the supplier', 'error');
      console.error('Error saving supplier:', error);
    }
  };

  const handleEdit = (supplier) => {
    setIsEdit(true);
    setEditSupplierId(supplier.id);
    setFormData({
      name: supplier.name,
      email: supplier.email
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
      showSnackbar('Supplier deleted successfully!', 'success');
      fetchSuppliers();
    } catch (error) {
      showSnackbar('An error occurred while deleting the supplier', 'error');
      console.error('Error deleting supplier:', error);
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
        Manage Suppliers
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen} startIcon={<AddCircleIcon />}>
        Add New Supplier
      </StyledButton>
      <StyledPaper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Supplier ID</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <StyledTableRow key={supplier.id}>
                <TableCell>{supplier.id}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleEdit(supplier)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(supplier.id)}
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
          {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Supplier Name"
            name="name"
            value={formData.name}
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
            label="Supplier Email"
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
        TransitionComponent={Fade} // Use Fade transition
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
