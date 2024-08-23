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
import api from '../api';
import MenuItem from '@mui/material/MenuItem';

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

export default function Pharmacists() {
  const [pharmacists, setPharmacists] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    national_id: '',
    license_number: '',
    qualification_name: '',
    qualification_type: 'Training',
    issue_date: '',
    expiration_date: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editPharmacistId, setEditPharmacistId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const fetchPharmacists = async () => {
    try {
      const response = await api.get('/pharmacists');
      if (response.status === 200) {
        setPharmacists(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        showSnackbar('Unexpected response format', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to fetch pharmacists', 'error');
      console.error('Error fetching pharmacists:', error);
    }
  };

  const handleOpen = () => {
    setIsEdit(false);
    setFormData({
      name: '',
      national_id: '',
      license_number: '',
      qualification_name: '',
      qualification_type: 'Training',
      issue_date: '',
      expiration_date: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await api.put(`/pharmacists/${editPharmacistId}`, formData);
        showSnackbar('Pharmacist updated successfully!', 'success');
      } else {
        await api.post('/pharmacists', formData);
        showSnackbar('Pharmacist added successfully!', 'success');
      }
      fetchPharmacists(); // Refresh the pharmacists list
      handleClose(); // Close the dialog
    } catch (error) {
      showSnackbar('An error occurred while saving the pharmacist', 'error');
      console.error('Error saving pharmacist:', error);
    }
  };

  const handleEdit = (pharmacist) => {
    setIsEdit(true);
    setEditPharmacistId(pharmacist.id);
    setFormData({
      name: pharmacist.name,
      national_id: pharmacist.national_id,
      license_number: pharmacist.license_number,
      qualification_name: pharmacist.qualification_name,
      qualification_type: pharmacist.qualification_type,
      issue_date: pharmacist.issue_date.split('T')[0],
      expiration_date: pharmacist.expiration_date?.split('T')[0] || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pharmacists/${id}`);
      showSnackbar('Pharmacist deleted successfully!', 'success');
      fetchPharmacists(); // Refresh the pharmacists list
    } catch (error) {
      showSnackbar('An error occurred while deleting the pharmacist', 'error');
      console.error('Error deleting pharmacist:', error);
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
        Manage Pharmacists
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen} startIcon={<AddCircleIcon />}>
        Add New Pharmacist
      </StyledButton>
      <StyledPaper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>National ID</StyledTableCell>
              <StyledTableCell>License Number</StyledTableCell>
              <StyledTableCell>Qualification</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Issue Date</StyledTableCell>
              <StyledTableCell>Expiration Date</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pharmacists.map((pharmacist) => (
              <StyledTableRow key={pharmacist.id}>
                <TableCell>{pharmacist.name}</TableCell>
                <TableCell>{pharmacist.national_id}</TableCell>
                <TableCell>{pharmacist.license_number || 'N/A'}</TableCell>
                <TableCell>{pharmacist.qualification_name}</TableCell>
                <TableCell>{pharmacist.qualification_type}</TableCell>
                <TableCell>{new Date(pharmacist.issue_date).toLocaleDateString()}</TableCell>
                <TableCell>{pharmacist.expiration_date ? new Date(pharmacist.expiration_date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleEdit(pharmacist)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(pharmacist.id)}
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
          {isEdit ? 'Edit Pharmacist' : 'Add New Pharmacist'}
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
            sx={textFieldStyle}
          />
          <TextField
            label="National ID"
            name="national_id"
            value={formData.national_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 16 }}
            variant="outlined"
            sx={textFieldStyle}
          />
          <TextField
            label="License Number"
            name="license_number"
            value={formData.license_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={textFieldStyle}
          />
          <TextField
            label="Qualification Name"
            name="qualification_name"
            value={formData.qualification_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={textFieldStyle}
          />
          <TextField
            select
            label="Qualification Type"
            name="qualification_type"
            value={formData.qualification_type}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={textFieldStyle}
          >
            <MenuItem value="Training">Training</MenuItem>
            <MenuItem value="Certification">Certification</MenuItem>
          </TextField>
          <TextField
            label="Issue Date"
            name="issue_date"
            value={formData.issue_date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            sx={textFieldStyle}
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
            variant="outlined"
            sx={textFieldStyle}
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

const textFieldStyle = {
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
};