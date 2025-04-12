'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';

export default function DebugPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [envVars, setEnvVars] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sheets');
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkEnvVars = async () => {
    try {
      const response = await fetch('/api/check-env');
      const result = await response.json();
      setEnvVars(result);
    } catch (err) {
      console.error('Error checking env vars:', err);
    }
  };

  useEffect(() => {
    checkEnvVars();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Google Sheets Debug Page</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Environment Variables Status</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            GOOGLE_SHEETS_CLIENT_EMAIL: {envVars.hasClientEmail ? '✅ Set' : '❌ Missing'}
          </Typography>
          <Typography variant="body1">
            GOOGLE_SHEETS_PRIVATE_KEY: {envVars.hasPrivateKey ? '✅ Set' : '❌ Missing'}
          </Typography>
          <Typography variant="body1">
            GOOGLE_SHEETS_SPREADSHEET_ID: {envVars.hasSpreadsheetId ? '✅ Set' : '❌ Missing'}
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={fetchData} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Test Google Sheets Connection'}
        </Button>
      </Box>
      
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
          <Typography variant="h6" color="error" gutterBottom>Error</Typography>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}
      
      {data && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Data Preview</Typography>
          <Box sx={{ 
            maxHeight: '400px', 
            overflow: 'auto',
            bgcolor: '#f5f5f5',
            p: 2,
            borderRadius: 1
          }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </Box>
          <Typography sx={{ mt: 2 }}>
            {Array.isArray(data) ? `Found ${data.length} records` : 'Data is not an array'}
          </Typography>
        </Paper>
      )}
    </Container>
  );
} 