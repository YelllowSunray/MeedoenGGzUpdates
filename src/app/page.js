'use client';
import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import ResultsList from './components/ResultsList';
import { searchAndFilter, analyzeActivityTypes } from './lib/search';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import dynamic from 'next/dynamic';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Fix hydration issues by dynamically importing components that rely on data
const DynamicResultsList = dynamic(() => Promise.resolve(ResultsList), {
  ssr: false
});

export default function Home() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    forWho: '',
    cost: '',
    location: '',
    activityType: ''
  });
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState(null);

  // Set mounted state to track client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to show in the UI if we're online
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Initial status
    updateNetworkStatus();
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Fetch Google Sheets data with retry logic
  const fetchSheetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching data (attempt ${retryCount + 1})...`);
      
      const startTime = performance.now();
      
      const response = await fetch('/api/sheets', {
        // Add cache control
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const endTime = performance.now();
      console.log(`Fetch completed in ${Math.round(endTime - startTime)}ms with status ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
      }
      
      const sheetsData = await response.json();
      
      if (!Array.isArray(sheetsData)) {
        throw new Error(`Invalid data format: expected array, got ${typeof sheetsData}`);
      }
      
      console.log('Data received:', sheetsData.length ? 'Yes' : 'No', 'Number of items:', sheetsData.length);
      
      setData(sheetsData);
      
      if (sheetsData.length === 0) {
        console.warn('No data items found in the response');
      }
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    if (mounted) {
      fetchSheetData();
    }
  }, [mounted, fetchSheetData]);

  // Implement retry button functionality
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Update search results when query, filters, or data changes
  useEffect(() => {
    if (loading) {
      return; // Don't update results while loading
    }
    
    if (data && data.length > 0) {
      const filteredResults = searchAndFilter(query, filters, data);
      setResults(filteredResults);
      
      console.log(`Search results: ${filteredResults.length} found from ${data.length} items`);
      console.log('Current query:', query ? `"${query}"` : 'None');
      console.log('Current filters:', Object.entries(filters).filter(([_, v]) => v).length ? filters : 'None');
    } else {
      setResults([]);
      if (!loading) { // Only log if we're not loading
        console.log('No data available to search');
      }
    }
  }, [query, filters, data, loading]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  // Only show loading indicator after component has mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Welcome Message */}
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: 'center', 
          mb: 2,
          color: 'text.secondary',
          fontStyle: 'italic',
          whiteSpace: 'nowrap',
        }}
      >
        Welkom bij de Activiteiten Zoeker
      </Typography>

      {/* Search and Filters Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <SearchBar onSearch={handleSearch} />
        <Filters onFilter={handleFilter} />
      </Paper>

      {/* Results Section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Probeer opnieuw
            </Button>
          }
        >
          {error}
        </Alert>
      ) : (
        <DynamicResultsList activities={results} />
      )}

      {/* Status Bar */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        bgcolor: 'background.paper', 
        p: 1, 
        borderTop: 1, 
        borderColor: 'divider',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'text.secondary'
      }}>
        Status: {networkStatus} | Data Source: {error ? 'Error' : 'Google Sheets'} | Data: {data.length} items loaded | Results: {results.length} items
      </Box>
    </Container>
  );
}