import React, { useState, useEffect } from 'react';
import {
  Button, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Typography, Box
} from '@mui/material';
import { styled } from '@mui/system';
import api from '../api';
import MenuItem from '@mui/material/MenuItem';


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
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Manage Pharmacists
      </Typography>
      <StyledButton variant="contained" onClick={handleOpen}>
        Add Pharmacist
      </StyledButton>
      <StyledPaper>
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
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pharmacists.map((pharmacist) => (
              <TableRow key={pharmacist.id}>
                <TableCell>{pharmacist.name}</TableCell>
                <TableCell>{pharmacist.national_id}</TableCell>
                <TableCell>{pharmacist.license_number || 'N/A'}</TableCell>
                <TableCell>{pharmacist.qualification_name}</TableCell>
                <TableCell>{pharmacist.qualification_type}</TableCell>
                <TableCell>{new Date(pharmacist.issue_date).toLocaleDateString()}</TableCell>
                <TableCell>{pharmacist.expiration_date ? new Date(pharmacist.expiration_date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(pharmacist)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(pharmacist.id)}
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
        <DialogTitle>{isEdit ? 'Edit Pharmacist' : 'Add Pharmacist'}</DialogTitle>
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
            label="National ID"
            name="national_id"
            value={formData.national_id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 16 }}
          />
          <TextField
            label="License Number"
            name="license_number"
            value={formData.license_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Qualification Name"
            name="qualification_name"
            value={formData.qualification_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Qualification Type"
            name="qualification_type"
            value={formData.qualification_type}
            onChange={handleChange}
            fullWidth
            margin="normal"
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
