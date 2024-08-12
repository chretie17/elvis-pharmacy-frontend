import React, { useState, useContext } from 'react';
import { TextField, Button, Container, Box, Typography } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div style={{ backgroundColor: '#242424', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container
        maxWidth="xs"
        sx={{
          backgroundColor: '#1a1a1a', // Dark background for the form container
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)', // Subtle shadow for a card-like appearance
        }}
      >
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#ffffff' }}>
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ style: { color: '#b0b0b0' } }} // Label color
              InputProps={{
                style: { color: '#ffffff' }, // Text color
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#646cff',
                    },
                    '&:hover fieldset': {
                      borderColor: '#535bf2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#646cff',
                    },
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ style: { color: '#b0b0b0' } }} // Label color
              InputProps={{
                style: { color: '#ffffff' }, // Text color
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#646cff',
                    },
                    '&:hover fieldset': {
                      borderColor: '#535bf2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#646cff',
                    },
                  },
                },
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
        </Box>
      </Container>
    </div>
  );
}
