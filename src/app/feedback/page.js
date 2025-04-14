'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Alert,
  Paper
} from '@mui/material';

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false, message: '' });

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          loading: false,
          success: true,
          error: false,
          message: 'Bedankt voor uw feedback! We nemen zo snel mogelijk contact met u op.'
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Er is iets misgegaan. Probeer het later opnieuw.');
      }
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: true,
        message: error.message
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Feedback Formulier
        </Typography>
        
        {status.message && (
          <Alert 
            severity={status.success ? "success" : "error"} 
            sx={{ mb: 3 }}
          >
            {status.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Naam"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            disabled={status.loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Adres"
            name="email"
            autoComplete="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={status.loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="subject"
            label="Onderwerp"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={status.loading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="message"
            label="Bericht"
            name="message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
            disabled={status.loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              backgroundColor: '#9c27b0',
              '&:hover': {
                backgroundColor: '#7b1fa2',
              }
            }}
            disabled={status.loading}
          >
            {status.loading ? 'Versturen...' : 'Verstuur Feedback'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
