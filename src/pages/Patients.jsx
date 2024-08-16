import React, { useState, useEffect } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, MenuItem, Snackbar, Alert, Autocomplete, 
  Paper, List, ListItem, ListItemText, Typography, Box, IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [prescription, setPrescription] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [insurances, setInsurances] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [finalCost, setFinalCost] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setSnackbarMessage('Failed to load patients');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const fetchInsurances = async () => {
      try {
        const response = await api.get('/insurances');
        setInsurances(response.data);
      } catch (error) {
        console.error('Error fetching insurances:', error);
        setSnackbarMessage('Failed to load insurances');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const fetchInventory = async () => {
      try {
        const response = await api.get('/inventory');
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setSnackbarMessage('Failed to load inventory');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchPatients();
    fetchInsurances();
    fetchInventory();
  }, []);

  const handleAddPatientClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setNationalId('');
    setPrescription([]);
    setAllergies('');
    setInsuranceId('');
    setSelectedMedicine(null);
    setQuantity(1);
    setTotalCost(0);
    setFinalCost(0);
  };

  const handleAddMedicineToPrescription = () => {
    if (selectedMedicine && quantity > 0) {
      const newMedicine = { ...selectedMedicine, quantity };
      setPrescription([...prescription, newMedicine]);
      setTotalCost(totalCost + newMedicine.price * quantity);
      updateFinalCost(insuranceId, totalCost + newMedicine.price * quantity);
      setSelectedMedicine(null);
      setQuantity(1);
    }
  };

  const handleRemoveMedicineFromPrescription = (index) => {
    const removedMedicine = prescription[index];
    const updatedPrescription = prescription.filter((_, i) => i !== index);
    setPrescription(updatedPrescription);
    setTotalCost(totalCost - removedMedicine.price * removedMedicine.quantity);
    updateFinalCost(insuranceId, totalCost - removedMedicine.price * removedMedicine.quantity);
  };

  const handleInsuranceChange = (e) => {
    const selectedInsuranceId = e.target.value;
    setInsuranceId(selectedInsuranceId);
    updateFinalCost(selectedInsuranceId, totalCost);
  };

  const updateFinalCost = (selectedInsuranceId, totalCost) => {
    const selectedInsurance = insurances.find(insurance => insurance.id === selectedInsuranceId);
    if (selectedInsurance) {
      const coverageRate = selectedInsurance.coverage_rate;
      setFinalCost(totalCost * (1 - coverageRate / 100));
    } else {
      setFinalCost(totalCost);
    }
  };

  const handleAddPatient = async () => {
    try {
      if (nationalId.length !== 16) {
        setSnackbarMessage('National ID must be exactly 16 characters long');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const response = await api.post('/patients', {
        name,
        national_id: nationalId,
        prescription: JSON.stringify(prescription),
        allergies,
        insurance_id: insuranceId,
      });

      setSnackbarMessage('Patient added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      handleClose();
      const fetchPatients = async () => {
        try {
          const response = await api.get('/patients');
          setPatients(response.data);
        } catch (error) {
          console.error('Error fetching patients:', error);
          setSnackbarMessage('Failed to load patients');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      };
      fetchPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
      setSnackbarMessage('Failed to add patient');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box className="max-w-7xl mx-auto p-8 bg-gray-100 min-h-screen">
      <Typography variant="h2" className="mb-8 text-4xl font-bold text-indigo-700 text-center">
        Patient Management
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />} 
        onClick={handleAddPatientClick} 
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Add New Patient
      </Button>
      <Paper className="rounded-lg shadow-lg overflow-hidden">
        <List className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <ListItem key={patient.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
              <ListItemText
                primary={<span className="text-lg font-semibold text-gray-800">{patient.name}</span>}
                secondary={
                  <span className="text-sm text-gray-600">
                    National ID: <span className="font-medium">{patient.national_id}</span> | 
                    Insurance: <span className="font-medium">{patient.insurance_name}</span>
                  </span>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle className="bg-indigo-600 text-white text-2xl font-bold">Add New Patient</DialogTitle>
        <DialogContent className="mt-4">
          <TextField
            label="Patient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            className="mb-4"
          />
          <TextField
            label="National ID"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 16 }}
            error={nationalId.length !== 16 && nationalId.length > 0}
            helperText={nationalId.length !== 16 && nationalId.length > 0 ? 'National ID must be 16 characters long' : ''}
            className="mb-4"
          />
          <Autocomplete
            options={inventory}
            getOptionLabel={(option) => option.name}
            value={selectedMedicine}
            onChange={(event, newValue) => setSelectedMedicine(newValue)}
            renderInput={(params) => <TextField {...params} label="Search Medicine" margin="normal" fullWidth />}
            className="mb-4"
          />
          <TextField
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
            className="mb-4"
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddMedicineToPrescription} 
            className="mb-4 bg-green-500 hover:bg-green-600 transition duration-300 ease-in-out"
          >
            Add Medicine to Prescription
          </Button>
          <Paper className="rounded-lg shadow-md p-4 mb-6 bg-gray-50">
            <Typography variant="h6" className="mb-2 text-gray-700">Prescription</Typography>
            <List>
              {prescription.map((item, index) => (
                <ListItem key={index} className="bg-white rounded-md shadow mb-2">
                  <ListItemText
                    primary={<span className="font-semibold">{`${item.name} - ${item.quantity} pcs`}</span>}
                    secondary={<span className="text-green-600">{`Price: RWF ${item.price * item.quantity}`}</span>}
                  />
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMedicineFromPrescription(index)} className="text-red-500 hover:text-red-700">
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
          <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg">
            <Typography variant="h6" className="text-gray-800">
              Total Cost: <span className="font-bold text-indigo-600">RWF {totalCost.toFixed(2)}</span>
            </Typography>
            <Typography variant="h6" className="text-gray-800">
              Final Cost: <span className="font-bold text-green-600">RWF {finalCost.toFixed(2)}</span>
            </Typography>
          </div>
          <TextField
            select
            label="Select Insurance"
            value={insuranceId}
            onChange={handleInsuranceChange}
            fullWidth
            margin="normal"
            className="mb-4"
          >
            {insurances.map((insurance) => (
              <MenuItem key={insurance.id} value={insurance.id}>
                {insurance.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions className="bg-gray-100 p-4">
          <Button onClick={handleClose} color="secondary" className="bg-gray-300 hover:bg-gray-400 text-gray-800">Cancel</Button>
          <Button onClick={handleAddPatient} color="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Patient</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }} className="rounded-lg shadow-lg">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}