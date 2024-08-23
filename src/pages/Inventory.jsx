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

const types = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'];

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
  maxWidth: '1200px',
  marginTop: theme?.spacing(3) || '24px',
  padding: theme?.spacing(2) || '16px',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
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
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: '#004d40',
  fontWeight: 'bold',
  fontSize: '14px',
  borderBottom: '2px solid #004d40',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#e0f2f1',
  },
  '&:hover': {
    backgroundColor: '#b2dfdb',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: '#004d40',
  '&:hover': {
    color: '#00695c',
  },
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
      <Typography variant="h3" gutterBottom color="#004d40" fontWeight="bold" textAlign="center">
        Pharmacy Inventory Management
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen} startIcon={<AddCircleIcon />}>
        Add New Item
      </StyledButton>
      <StyledPaper elevation={6}>
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
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <StyledTableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.expiration_date.split('T')[0]}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell align="center">
                  <ActionButton onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </ActionButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledPaper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '16px',
        }
      }}>
        <DialogTitle sx={{ color: '#004d40', fontWeight: 'bold' }}>
          {isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
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
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Expiration Date"
            name="expiration_date"
            type="date"
            value={formData.expiration_date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Price (RWF)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Minimum Age Allowed"
            name="age_allowed_min"
            value={formData.age_allowed_min}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Maximum Age Allowed"
            name="age_allowed_max"
            value={formData.age_allowed_max}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Usage Instructions"
            name="usage_instructions"
            value={formData.usage_instructions}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Side Effects"
            name="side_effects"
            value={formData.side_effects}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
          <TextField
            label="Contraindications"
            name="contraindications"
            value={formData.contraindications}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#004d40' } } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#004d40' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#004d40', '&:hover': { bgcolor: '#00695c' } }}>
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
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
