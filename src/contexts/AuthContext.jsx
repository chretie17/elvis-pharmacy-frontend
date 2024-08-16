import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../Api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Save the token and user data to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // Redirect based on role
      if (user.role === 'Admin') {
        navigate('/dashboard');
      } else if (user.role === 'Inventory Manager') {
        navigate('/inventory');
      } else if (user.role === 'Pharmacist') {
        navigate('/pharmacist-dashboard');
      } else {
        navigate('/'); // Default redirect if role doesn't match
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser)); // Parse and set the user from localStorage
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
