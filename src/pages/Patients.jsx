import React, { useState, useEffect } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, MenuItem, Snackbar, Alert, Autocomplete, 
  Paper, List, ListItem, ListItemText, Typography, Box, IconButton, 
  DialogContentText 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [open, setOpen] = useState(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [age, setAge] = useState('');
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
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchInsurances();
    fetchInventory();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      const processedPatients = response.data.map(patient => ({
        ...patient,
        total_cost: parseFloat(patient.total_cost), 
        final_cost: parseFloat(patient.final_cost)
      }));
      setPatients(processedPatients);
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

  const handleAddPatientClick = () => {
    setEditingPatient(null);
    resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setNationalId('');
    setAge('');
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
      const inventoryItem = inventory.find(item => item.id === selectedMedicine.id);

      if (age < inventoryItem.age_allowed_min || age > inventoryItem.age_allowed_max) {
        setSnackbarMessage(`Medicine ${inventoryItem.name} is not allowed for patients aged ${age}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (inventoryItem.quantity === 0) {
        setSnackbarMessage(`Medicine ${inventoryItem.name} is out of stock.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      } else if (quantity > inventoryItem.quantity) {
        setSnackbarMessage(`Only ${inventoryItem.quantity} units of ${inventoryItem.name} available.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const newMedicine = { 
        ...selectedMedicine, 
        quantity, 
        price: parseFloat(selectedMedicine.price),
        manufacturer: inventoryItem.manufacturer, 
        type: inventoryItem.type,
        expiration_date: inventoryItem.expiration_date.split('T')[0],
        age_allowed_min: inventoryItem.age_allowed_min,
        age_allowed_max: inventoryItem.age_allowed_max,
        usage_instructions: inventoryItem.usage_instructions,
        side_effects: inventoryItem.side_effects,
        contraindications: inventoryItem.contraindications
      };
      const updatedPrescription = [...prescription, newMedicine];
      setPrescription(updatedPrescription);
      const updatedTotalCost = totalCost + newMedicine.price * quantity;
      setTotalCost(updatedTotalCost);
      updateFinalCost(insuranceId, updatedTotalCost);
      setSelectedMedicine(null);
      setQuantity(1);
    }
  };

  const handleRemoveMedicineFromPrescription = (index) => {
    const removedMedicine = prescription[index];
    const updatedPrescription = prescription.filter((_, i) => i !== index);
    setPrescription(updatedPrescription);
    const updatedTotalCost = totalCost - parseFloat(removedMedicine.price) * removedMedicine.quantity;
    setTotalCost(updatedTotalCost);
    updateFinalCost(insuranceId, updatedTotalCost);
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

  const handleAddOrUpdatePatient = async () => {
    try {
      if (nationalId.length !== 16) {
        setSnackbarMessage('National ID must be exactly 16 characters long');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const patientData = {
        name,
        national_id: nationalId,
        age, 
        prescription: JSON.stringify(prescription),
        allergies,
        insurance_id: insuranceId,
        total_cost: totalCost.toFixed(2),
        final_cost: finalCost.toFixed(2)
      };

      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, patientData);
        setSnackbarMessage('Patient updated successfully!');
      } else {
        await api.post('/patients', patientData);
        setSnackbarMessage('Patient added successfully!');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      handleClose();
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      setSnackbarMessage('Failed to save patient');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setNationalId(patient.national_id);
    setAge(patient.age);
    setPrescription(JSON.parse(patient.prescription).map(med => ({
      ...med,
      price: parseFloat(med.price)
    })));
    setAllergies(patient.allergies);
    setInsuranceId(patient.insurance_id);
    setTotalCost(parseFloat(patient.total_cost));
    setFinalCost(parseFloat(patient.final_cost));
    setOpen(true);
  };

  const handleDeletePatient = async (id) => {
    setConfirmDeleteDialogOpen(true);
    setPatientToDelete(id);
  };

  const confirmDeletePatient = async () => {
    try {
      await api.delete(`/patients/${patientToDelete}`);
      setSnackbarMessage('Patient deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setConfirmDeleteDialogOpen(false);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      setSnackbarMessage('Failed to delete patient');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleViewPrescription = (patient) => {
    const prescriptionData = JSON.parse(patient.prescription);
    setCurrentPrescription(prescriptionData);
    setOpenPrescriptionDialog(true);
  };

  const handleClosePrescriptionDialog = () => {
    setOpenPrescriptionDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  return (
    <Box className="max-w-6xl mx-auto p-5 bg-gray-50 rounded-lg shadow-lg">
      <Typography variant="h4" className="mb-8 text-center text-green-700 font-bold">
        Patients Management
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />} 
        onClick={handleAddPatientClick} 
        className="mb-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-all"
      >
        {editingPatient ? 'Update Patient' : 'Add New Patient'}
      </Button>
      <Paper className="border border-gray-200 rounded-lg p-4 mb-8 shadow-sm bg-white">
        <List>
          {patients.map((patient) => (
            <ListItem key={patient.id} divider className="hover:bg-green-50 transition-colors flex justify-between items-center">
              <ListItemText
                primary={<span className="text-lg font-semibold text-blue-800">{patient.name}</span>}
                secondary={`National ID: ${patient.national_id} | Insurance: ${patient.insurance_name}`}
                className="text-gray-600"
              />
              <div className="flex gap-2">
                <IconButton aria-label="view prescription" onClick={() => handleViewPrescription(patient)}>
                  <VisibilityIcon className="text-green-700" />
                </IconButton>
                <IconButton aria-label="edit" onClick={() => handleEditPatient(patient)}>
                  <EditIcon className="text-blue-700" />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDeletePatient(patient.id)}>
                  <DeleteIcon className="text-red-700" />
                </IconButton>
              </div>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle className="bg-green-600 text-white text-lg font-semibold">
          {editingPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent className="bg-gray-50">
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
          <TextField
            label="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
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
            className="mb-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
          >
            Add Medicine to Prescription
          </Button>
          <Paper className="border border-gray-200 rounded-lg p-4 mb-8 shadow-sm bg-white">
            <List>
              {prescription.map((item, index) => (
                <ListItem key={index} className="hover:bg-green-50 transition-colors">
                  <ListItemText
                    primary={`${item.name} - ${item.quantity} pcs`}
                    secondary={`Manufacturer: ${item.manufacturer} | Type: ${item.type} | Expiration Date: ${item.expiration_date} | Price: RWF ${item.price * item.quantity}`}
                    className="text-gray-600"
                  />
                  <ListItemText
                    secondary={
                      <>
                        <Typography variant="body2" className="text-gray-700">
                          Age Allowed: {item.age_allowed_min} - {item.age_allowed_max} years
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          Usage Instructions: {item.usage_instructions}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          Side Effects: {item.side_effects}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          Contraindications: {item.contraindications}
                        </Typography>
                      </>
                    }
                    className="text-gray-600 mt-2"
                  />
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMedicineFromPrescription(index)}>
                    <DeleteIcon className="text-red-500" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h6" className="text-gray-700 font-semibold">
              Total Cost: RWF {typeof totalCost === 'number' ? totalCost.toFixed(2) : '0.00'}
            </Typography>
            <Typography variant="h6" className="text-gray-700 font-semibold">
              Final Cost (after insurance): RWF {typeof finalCost === 'number' ? finalCost.toFixed(2) : '0.00'}
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
              <MenuItem key={insurance.id} value={insurance.id} className="text-gray-700">
                {insurance.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions className="bg-gray-100">
          <Button onClick={handleClose} color="secondary" className="text-gray-600">
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdatePatient} color="primary" className="bg-green-600 hover:bg-green-700 text-white">
            {editingPatient ? 'Update Patient' : 'Add Patient'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPrescriptionDialog} onClose={handleClosePrescriptionDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-green-600 text-white text-lg font-semibold">
          Prescription Details
        </DialogTitle>
        <DialogContent className="bg-gray-50">
          <Paper className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
            <List>
              {currentPrescription.map((item, index) => (
                <ListItem key={index} className="hover:bg-green-50 transition-colors">
                  <ListItemText
                    primary={`${item.name} - ${item.quantity} pcs`}
                    secondary={`Manufacturer: ${item.manufacturer} | Type: ${item.type} | Expiration Date: ${item.expiration_date} | Price: RWF ${item.price * item.quantity}`}
                    className="text-gray-600"
                  />
                  <ListItemText
                    secondary={
                      <>
                        <Typography variant="body2" className="text-gray-700">
                          Age Allowed: {item.age_allowed_min} - {item.age_allowed_max} years
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          Usage Instructions: {item.usage_instructions}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          Side Effects: {item.side_effects}
                        </Typography>
                        <Typography variant="body2" className="text-gray-700">
                          Contraindications: {item.contraindications}
                        </Typography>
                      </>
                    }
                    className="text-gray-600 mt-2"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions className="bg-gray-100">
          <Button onClick={handleClosePrescriptionDialog} color="primary" className="bg-green-600 hover:bg-green-700 text-white">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="bg-red-600 text-white text-lg font-semibold">
          Confirm Deletion
        </DialogTitle>
        <DialogContent className="bg-gray-50">
          <DialogContentText className="text-gray-700">
            Are you sure you want to delete this patient? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="bg-gray-100">
          <Button onClick={handleCloseDeleteDialog} color="secondary" className="text-gray-600">
            Cancel
          </Button>
          <Button onClick={confirmDeletePatient} color="primary" className="bg-red-600 hover:bg-red-700 text-white">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} className="w-full">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
