import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, IconButton, InputAdornment, Checkbox, FormControlLabel, Divider, Snackbar, Alert } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import pharmacyImage from '../assets/pharamacy.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setSnackbarMessage('Login Successful!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Login Failed. Please check your credentials.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(rgba(0, 77, 64, 0.8), rgba(0, 77, 64, 0.8)), url(${pharmacyImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '3rem',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <Typography variant="h3" sx={{ color: '#004d40', textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
          PharmaInsight
        </Typography>
        <Typography variant="h5" sx={{ color: '#004d40', textAlign: 'center', mb: 4, fontWeight: 'light' }}>
          Welcome Back 👋🏻
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { color: '#004d40' } }}
            InputProps={{
              style: { color: '#004d40' },
              sx: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#004d40',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#004d40',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#004d40',
                  },
                },
              },
            }}
          />
          <TextField
            label="Password"
            type={isPasswordShown ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: '#004d40' } }}
            InputProps={{
              style: { color: '#004d40' },
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    edge='end'
                    onClick={handleClickShowPassword}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ color: '#004d40' }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#004d40',
                    borderWidth: '2px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#004d40',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#004d40',
                  },
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <FormControlLabel 
              control={<Checkbox sx={{ color: '#004d40', '&.Mui-checked': { color: '#004d40' } }} />} 
              label='Remember me' 
              sx={{ color: '#004d40' }} 
            />
            <Typography component={Link} to='/#' sx={{ color: '#004d40', textDecoration: 'none', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>
              Forgot password?
            </Typography>
          </Box>
          <Button 
            fullWidth 
            variant="contained" 
            type="submit" 
            sx={{ 
              mt: 4, 
              mb: 2,
              backgroundColor: '#004d40', 
              '&:hover': { 
                backgroundColor: '#00695c' 
              },
              fontSize: '1.1rem',
              fontWeight: 'bold',
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 77, 64, 0.3)',
              '&:active': {
                transform: 'translateY(2px)',
                boxShadow: '0 2px 4px rgba(0, 77, 64, 0.3)',
              }
            }}
          >
            Log In
          </Button>
          <Divider sx={{ my: 4, borderColor: '#004d40', '&::before, &::after': { borderColor: '#004d40' } }}>
            <Typography sx={{ color: '#004d40', px: 2, fontWeight: 'bold' }}>OR</Typography>
          </Divider>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            {['facebook', 'twitter', 'github', 'google'].map((social) => (
              <IconButton 
                key={social} 
                size='large' 
                sx={{ 
                  color: '#004d40', 
                  border: '2px solid #004d40',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    backgroundColor: '#004d40', 
                    color: 'white',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <i className={`ri-${social}-fill`} />
              </IconButton>
            ))}
          </Box>
          <Typography sx={{ textAlign: 'center', mt: 4, color: '#004d40' }}>
            New on our platform? <Link to='/register' style={{ color: '#004d40', textDecoration: 'none', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}>Create an account</Link>
          </Typography>
        </form>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}