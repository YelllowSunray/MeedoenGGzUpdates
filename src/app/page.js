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
import { useSearchParams } from 'next/navigation';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Fix hydration issues by dynamically importing components that rely on data
const DynamicResultsList = dynamic(() => Promise.resolve(ResultsList), {
  ssr: false
});

export default function Home() {
  const searchParams = useSearchParams();
  const debugMode = searchParams.get('debug') === 'true';
  const [showDebugFields, setShowDebugFields] = useState(false);
  
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
      
      if (debugMode) {
        console.log('Fetched data:', sheetsData);
        
        // Log available fields from first item
        if (sheetsData.length > 0) {
          console.log('Available fields in first item:', Object.keys(sheetsData[0]));
          console.log('First item values:', sheetsData[0]);
          
          // Add these lines to specifically check category field
          console.log('Category field value:', sheetsData[0]['Shiva Categorie']);
          console.log('All possible category fields:', {
            'Shiva Categorie': sheetsData[0]['Shiva Categorie'],
            'Category': sheetsData[0]['Category'],
            'Categorie': sheetsData[0]['Categorie'],
            'Unnamed: 1': sheetsData[0]['Unnamed: 1']
          });
        }
      }
      
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
  }, [debugMode, retryCount]);

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
      
      if (debugMode) {
        console.log(`Found ${filteredResults.length} results from ${data.length} items`);
        console.log('Query:', query);
        console.log('Filters:', filters);
      }
    } else {
      setResults([]);
      if (!loading) { // Only log if we're not loading
        console.log('No data available to search');
      }
    }
  }, [query, filters, data, debugMode, loading]);

  // Add this useEffect to analyze activity types
  useEffect(() => {
    if (data && data.length > 0 && debugMode) {
      const activityTypeAnalysis = analyzeActivityTypes(data);
      console.log('Most popular activity types:', activityTypeAnalysis);
    }
  }, [data, debugMode]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const toggleDebugFields = () => {
    setShowDebugFields(!showDebugFields);
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
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          mx: 'auto',
          fontSize: '1.1rem'
        }}
      >
        Verbinden van mensen van alle achtergronden met warme en vriendelijke activiteiten
      </Typography>

      {/* Search Block */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          bgcolor: 'white',
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Zoek een activiteit
        </Typography>
        <SearchBar onSearch={handleSearch} />
      </Paper>

      {/* Categorization Block */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          bgcolor: 'white',
          maxWidth: '800px',
          mx: 'auto'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Categorieën
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Filters onFilter={handleFilter} data={data} />
        </Box>
      </Paper>

      {/* Status info - visible in all modes */}
      <Box sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
        <Alert severity="info">
          <strong>Status:</strong> {networkStatus ? `${networkStatus}` : 'checking...'} | 
          <strong> Data Source:</strong> Local JSON | 
          <strong> Data:</strong> {loading ? 'loading...' : data.length > 0 ? `${data.length} items loaded` : 'no data'} | 
          <strong> Results:</strong> {results.length} items
          {error && <div><strong>Error:</strong> {error}</div>}
        </Alert>
      </Box>

      {/* Results Section */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Activiteiten worden geladen...</Typography>
        </Box>
      ) : (
        <>
          {debugMode && (
            <Box sx={{ mb: 2, mt: 2, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="subtitle2">
                Resultaten: {results.length} van {data.length} items
              </Typography>
              
              {data.length > 0 && (
                <Box sx={{ mt: 2, mb: 2, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: '#f5f5f5', 
                      borderBottom: showDebugFields ? '1px solid #ddd' : 'none',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={toggleDebugFields}
                  >
                    <Typography>Beschikbare velden in data</Typography>
                    <div style={{ fontSize: '24px' }}>{showDebugFields ? '▼' : '▶'}</div>
                  </Box>
                  
                  {showDebugFields && (
                    <Box sx={{ p: 2 }}>
                      <Typography component="div">
                        <strong>Eerste data item velden:</strong>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {Object.keys(data[0]).map(field => (
                            <Box component="li" key={field}>
                              <strong>{field}:</strong> {String(data[0][field] || '')}
                            </Box>
                          ))}
                        </Box>
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
          
          <DynamicResultsList 
            activities={results} 
            debug={debugMode}
          />
          
          {!loading && data.length === 0 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="contained"
                color="primary"
                onClick={handleRetry}
                sx={{ mt: 2 }}
              >
                Probeer opnieuw te laden
              </Button>
            </Box>
          )}
          
          {debugMode && results.length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="subtitle2">Eerste resultaat (debug):</Typography>
              <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(results[0], null, 2)}
              </pre>
            </Box>
          )}
          
          {debugMode && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined"
                size="small"
                href="/debug/sheet"
                target="_blank"
              >
                Open Sheet Debug Tool
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}