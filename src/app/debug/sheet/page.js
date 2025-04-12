'use client';
import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField, MenuItem, Select } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function SheetDebugPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sheetName, setSheetName] = useState('Blad1');
  const [range, setRange] = useState('A:O');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/debug/sheet?sheet=${sheetName}&range=${range}`);
      
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Google Sheet Debug</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Sheet Configuration</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Sheet Name"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            size="small"
            helperText="Usually 'Sheet1' or 'Blad1'"
          />
          <TextField
            label="Range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            size="small" 
            helperText="e.g., A:O or A1:O100"
          />
          <Button 
            variant="contained" 
            onClick={fetchData}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? 'Loading...' : 'Test Connection'}
          </Button>
        </Box>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
          <Typography variant="h6" color="error" gutterBottom>Error</Typography>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}
      
      {data && data.rawValues && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Raw Sheet Data</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  {data.rawValues[0]?.map((header, i) => (
                    <TableCell key={i}>{header || `Column ${i+1}`}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.rawValues.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>{rowIndex + 1}</TableCell>
                    {data.rawValues[0].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        {row[colIndex] || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {data && data.transformedData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Transformed Data (First Item)</Typography>
          <Box sx={{ 
            maxHeight: '400px', 
            overflow: 'auto',
            bgcolor: '#f5f5f5',
            p: 2,
            borderRadius: 1
          }}>
            <pre>{JSON.stringify(data.transformedData[0], null, 2)}</pre>
          </Box>
          <Typography sx={{ mt: 2 }}>
            Found {data.transformedData.length} record(s)
          </Typography>
        </Paper>
      )}
    </Container>
  );
} 