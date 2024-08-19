import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, IconButton, InputAdornment, Checkbox, FormControlLabel, Divider, Snackbar, Alert } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import pharmacyImage from '../assets/pharamacy.jpg'; // Ensure this path is correct

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
        navigate('/'); // Redirect after showing success message
      }, 1500); // Delay for redirect
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
        backgroundImage: `url(${pharmacyImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Light overlay for better text contrast
          padding: '3rem',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Typography variant="h4" sx={{ color: '#00695c', textAlign: 'center', mb: 3 }}>
          Welcome to PharmaInsight 👋🏻
        </Typography>
        <Typography sx={{ color: '#004d40', textAlign: 'center', mb: 3 }}>
          Please sign in to your account and start the work 
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
                    borderColor: '#80cbc4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#26a69a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00695c',
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
                    borderColor: '#80cbc4',
                  },
                  '&:hover fieldset': {
                    borderColor: '#26a69a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00695c',
                  },
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <FormControlLabel control={<Checkbox sx={{ color: '#004d40' }} />} label='Remember me' sx={{ color: '#004d40' }} />
            <Typography component={Link} to='/#' sx={{ color: '#004d40', textDecoration: 'none' }}>
              Forgot password?
            </Typography>
          </Box>
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3, backgroundColor: '#26a69a', '&:hover': { backgroundColor: '#00897b' } }}>
            Log In
          </Button>
          <Divider sx={{ my: 4, borderColor: '#004d40' }}>or</Divider>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton size='small' sx={{ color: '#004d40' }}>
              <i className='ri-facebook-fill' />
            </IconButton>
            <IconButton size='small' sx={{ color: '#004d40' }}>
              <i className='ri-twitter-fill' />
            </IconButton>
            <IconButton size='small' sx={{ color: '#004d40' }}>
              <i className='ri-github-fill' />
            </IconButton>
            <IconButton size='small' sx={{ color: '#004d40' }}>
              <i className='ri-google-fill' />
            </IconButton>
          </Box>
          <Typography sx={{ textAlign: 'center', mt: 3, color: '#004d40' }}>
            New on our platform? <Link to='/register' style={{ color: '#26a69a', textDecoration: 'none' }}>Create an account</Link>
          </Typography>
        </form>

        {/* Snackbar for success/failure messages */}
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
