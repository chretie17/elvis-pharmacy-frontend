import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const AnimatedBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #e0f2f1;
  padding: 24px;
`;

const AnimatedTypography = styled(motion.div)`
  text-align: center;
`;

const AnimatedButton = styled(motion(Button))`
  margin-top: 20px;
  background-color: #004d40;
  color: white;
  &:hover {
    background-color: #00695c;
  }
`;

export default function ThankYou() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/');  // Redirect to home or any other page
    };

    return (
        <AnimatedBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <AnimatedTypography
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            >
                <Typography variant="h3" color="#004d40" fontWeight="bold" gutterBottom>
                    Thank You!
                </Typography>
            </AnimatedTypography>
            
            <AnimatedTypography
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
            >
                <Typography variant="h5" color="#004d40" gutterBottom>
                    The order has been accepted successfully. We are waiting for it now.
                </Typography>
            </AnimatedTypography>

           
        </AnimatedBox>
    );
}