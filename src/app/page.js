'use client';
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import ResultsList from './components/ResultsList';
import { searchAndFilter, analyzeActivityTypes } from './lib/search';
import dynamic from 'next/dynamic';
import Button from '@mui/material/Button';

// Fix hydration issues by dynamically importing components that rely on data
const DynamicResultsList = dynamic(() => Promise.resolve(ResultsList), {
  ssr: false
});

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    targetAudience: '',
    cost: '',
    activityType: ''
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching activities from API...');
        
        const response = await fetch('/api/sheets');
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received activities count:', data.length);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array');
        }
        
        if (data.length === 0) {
          console.warn('No activities found in the response');
        } else {
          console.log('First activity:', data[0]);
        }
        
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading activities: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <Box sx={{ mb: 4 }}>
          <Filters 
            filters={filters} 
            setFilters={setFilters} 
            activities={activities}
          />
        </Box>
        
        <ResultsList 
          activities={activities}
          searchQuery={searchQuery}
          filters={filters}
        />
      </Box>
    </Container>
  );
}