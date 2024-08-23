import React, { useState, useEffect } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, MenuItem, Snackbar, Alert, Autocomplete, 
  Paper, List, ListItem, ListItemText, Typography, Box, IconButton, 
  DialogContentText, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';
import { styled } from '@mui/system';

const primaryColor = '#004d40';
const secondaryColor = '#00796b';

const StyledPaper = styled(Paper)({
  padding: '24px',
  marginBottom: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 77, 64, 0.15)',
});

const StyledButton = styled(Button)({
  backgroundColor: primaryColor,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: secondaryColor,
  },
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
});

const StyledIconButton = styled(IconButton)({
  color: primaryColor,
  '&:hover': {
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
  },
});

const StyledListItem = styled(ListItem)({
  borderRadius: '8px',
  marginBottom: '8px',
  '&:hover': {
    backgroundColor: 'rgba(0, 77, 64, 0.05)',
  },
});

const StyledChip = styled(Chip)({
  backgroundColor: 'rgba(0, 77, 64, 0.1)',
  color: primaryColor,
  fontWeight: 'bold',
  margin: '0 4px',
});

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
    <Box className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-xl">
      <Typography variant="h3" className="mb-8 text-center font-bold" style={{ color: primaryColor }}>
        Patients Management
      </Typography>
      <StyledButton 
        startIcon={<AddIcon />} 
        onClick={handleAddPatientClick} 
        className="mb-8"
      >
        {editingPatient ? 'Update Patient' : 'Add New Patient'}
      </StyledButton>
      <StyledPaper>
        <List>
          {patients.map((patient) => (
            <StyledListItem key={patient.id} divider>
              <ListItemText
                primary={<span className="text-xl font-semibold" style={{ color: primaryColor }}>{patient.name}</span>}
                secondary={
                  <Box>
                    <Typography variant="body2" className="text-gray-600">National ID: {patient.national_id}</Typography>
                    <Typography variant="body2" className="text-gray-600">Insurance: {patient.insurance_name}</Typography>
                    <Box mt={1}>
                      <StyledChip label={`Total Cost: RWF ${patient.total_cost}`} size="small" />
                      <StyledChip label={`Final Cost: RWF ${patient.final_cost}`} size="small" />
                    </Box>
                  </Box>
                }
              />
              <Box>
                <StyledIconButton aria-label="view prescription" onClick={() => handleViewPrescription(patient)}>
                  <VisibilityIcon />
                </StyledIconButton>
                <StyledIconButton aria-label="edit" onClick={() => handleEditPatient(patient)}>
                  <EditIcon />
                </StyledIconButton>
                <StyledIconButton aria-label="delete" onClick={() => handleDeletePatient(patient.id)}>
                  <DeleteIcon />
                </StyledIconButton>
              </Box>
            </StyledListItem>
          ))}
        </List>
      </StyledPaper>
  
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle style={{ backgroundColor: primaryColor, color: 'white' }}>
          {editingPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#f5f5f5' }}>
          <TextField
            label="Patient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: primaryColor } }}
            InputProps={{ style: { color: primaryColor } }}
          />
          <TextField
            label="National ID"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: primaryColor } }}
            InputProps={{ style: { color: primaryColor } }}
            inputProps={{ maxLength: 16 }}
            error={nationalId.length !== 16 && nationalId.length > 0}
            helperText={nationalId.length !== 16 && nationalId.length > 0 ? 'National ID must be 16 characters long' : ''}
          />
          <TextField
            label="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
            variant="outlined"
            InputLabelProps={{ style: { color: primaryColor } }}
            InputProps={{ style: { color: primaryColor } }}
          />
          <Autocomplete
            options={inventory}
            getOptionLabel={(option) => option.name}
            value={selectedMedicine}
            onChange={(event, newValue) => setSelectedMedicine(newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search Medicine" 
                margin="normal" 
                fullWidth 
                variant="outlined"
                InputLabelProps={{ style: { color: primaryColor } }}
                InputProps={{ ...params.InputProps, style: { color: primaryColor } }}
              />
            )}
          />
          <TextField
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
            variant="outlined"
            InputLabelProps={{ style: { color: primaryColor } }}
            InputProps={{ style: { color: primaryColor } }}
          />
          <StyledButton 
            onClick={handleAddMedicineToPrescription} 
            style={{ marginTop: '16px', marginBottom: '16px' }}
          >
            Add Medicine to Prescription
          </StyledButton>
          
          <Typography variant="h6" style={{ color: primaryColor, marginTop: '16px', marginBottom: '8px' }}>
            Prescription
          </Typography>
          <Paper style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'white' }}>
            <List>
              {prescription.map((item, index) => (
                <ListItem key={index} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                  <ListItemText
                    primary={<span style={{ color: primaryColor, fontWeight: 'bold' }}>{item.name} - {item.quantity} pcs</span>}
                    secondary={
                      <>
                        <Typography variant="body2">Manufacturer: {item.manufacturer} | Type: {item.type}</Typography>
                        <Typography variant="body2">Expiration Date: {item.expiration_date}</Typography>
                        <Typography variant="body2">Price: RWF {item.price * item.quantity}</Typography>
                        <Typography variant="body2">Age Allowed: {item.age_allowed_min} - {item.age_allowed_max} years</Typography>
                        <Typography variant="body2">Usage Instructions: {item.usage_instructions}</Typography>
                        <Typography variant="body2">Side Effects: {item.side_effects}</Typography>
                        <Typography variant="body2">Contraindications: {item.contraindications}</Typography>
                      </>
                    }
                  />
                  <StyledIconButton edge="end" aria-label="delete" onClick={() => handleRemoveMedicineFromPrescription(index)}>
                    <DeleteIcon />
                  </StyledIconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
          
          <Box display="flex" justifyContent="space-between" marginBottom="16px">
            <Typography variant="h6" style={{ color: primaryColor }}>
              Total Cost: RWF {typeof totalCost === 'number' ? totalCost.toFixed(2) : '0.00'}
            </Typography>
            <Typography variant="h6" style={{ color: primaryColor }}>
              Final Cost: RWF {typeof finalCost === 'number' ? finalCost.toFixed(2) : '0.00'}
            </Typography>
          </Box>
          
          <TextField
            select
            label="Select Insurance"
            value={insuranceId}
            onChange={handleInsuranceChange}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: primaryColor } }}
            InputProps={{ style: { color: primaryColor } }}
          >
            {insurances.map((insurance) => (
              <MenuItem key={insurance.id} value={insurance.id}>
                {insurance.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleClose} style={{ color: primaryColor }}>
            Cancel
          </Button>
          <StyledButton onClick={handleAddOrUpdatePatient}>
            {editingPatient ? 'Update Patient' : 'Add Patient'}
          </StyledButton>
        </DialogActions>
      </Dialog>
  
      <Dialog open={openPrescriptionDialog} onClose={handleClosePrescriptionDialog} maxWidth="sm" fullWidth>
        <DialogTitle style={{ backgroundColor: primaryColor, color: 'white' }}>
          Prescription Details
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#f5f5f5' }}>
          <Paper style={{ padding: '16px', marginTop: '16px', backgroundColor: 'white' }}>
            <List>
              {currentPrescription.map((item, index) => (
                <ListItem key={index} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                  <ListItemText
                    primary={<span style={{ color: primaryColor, fontWeight: 'bold' }}>{item.name} - {item.quantity} pcs</span>}
                    secondary={
                      <>
                        <Typography variant="body2">Manufacturer: {item.manufacturer} | Type: {item.type}</Typography>
                        <Typography variant="body2">Expiration Date: {item.expiration_date}</Typography>
                        <Typography variant="body2">Price: RWF {item.price * item.quantity}</Typography>
                        <Typography variant="body2">Age Allowed: {item.age_allowed_min} - {item.age_allowed_max} years</Typography>
                        <Typography variant="body2">Usage Instructions: {item.usage_instructions}</Typography>
                        <Typography variant="body2">Side Effects: {item.side_effects}</Typography>
                        <Typography variant="body2">Contraindications: {item.contraindications}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#f5f5f5' }}>
          <StyledButton onClick={handleClosePrescriptionDialog}>
            Close
          </StyledButton>
        </DialogActions>
      </Dialog>
  
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ backgroundColor: primaryColor, color: 'white' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent style={{ backgroundColor: '#f5f5f5', marginTop: '16px' }}>
          <DialogContentText>
            Are you sure you want to delete this patient? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleCloseDeleteDialog} style={{ color: primaryColor }}>
            Cancel
          </Button>
          <StyledButton onClick={confirmDeletePatient} style={{ backgroundColor: '#d32f2f' }}>
            Confirm Delete
          </StyledButton>
        </DialogActions>
      </Dialog>
  
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} style={{ backgroundColor: primaryColor, color: 'white' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
)};
