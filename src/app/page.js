'use client';
import { useState, useEffect } from 'react';
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
    location: ''
  });
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to track client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Google Sheets data
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/sheets');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
        }
        
        const sheetsData = await response.json();
        
        if (!Array.isArray(sheetsData)) {
          throw new Error(`Invalid data format: expected array, got ${typeof sheetsData}`);
        }
        
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
    };

    if (mounted) {
      fetchSheetData();
    }
  }, [mounted, debugMode]);

  // Update search results when query, filters, or data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const filteredResults = searchAndFilter(query, filters, data);
      setResults(filteredResults);
      
      if (debugMode) {
        console.log(`Found ${filteredResults.length} results from ${data.length} items`);
        console.log('Query:', query);
        console.log('Filters:', filters);
      }
    } else {
      setResults([]);
    }
  }, [query, filters, data, debugMode]);

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

      {/* Error and Debug Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Er is een fout opgetreden: {error}
        </Alert>
      )}
      
      {debugMode && (
        <Alert severity="info" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Debug mode actief. Data items: {data?.length || 0}
        </Alert>
      )}

      {/* Results Section */}
      {loading ? (
        <Typography sx={{ textAlign: 'center' }}>Activiteiten worden geladen...</Typography>
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