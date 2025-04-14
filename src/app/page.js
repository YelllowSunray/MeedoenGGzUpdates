'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import ResultsList from './components/ResultsList';

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    domain: null
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchActivities = async () => {
      try {
        console.log('Fetching activities...');
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/sheets', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        setActivities(data);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [mounted]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDomainFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, domain: newFilters.domain }));
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mb: 3,
        width: '100%'
      }}>
        <Box sx={{ width: '400px' }}>
          <SearchBar onSearch={handleSearch} />
        </Box>
      </Box>
      <Filters 
        filters={filters}
        onFilterChange={handleDomainFilterChange}
      />
      <ResultsList 
        activities={activities} 
        searchQuery={searchQuery}
        filters={filters}
      />
    </Box>
  );
}