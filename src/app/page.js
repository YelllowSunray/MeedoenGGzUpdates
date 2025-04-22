'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import ResultsList from './components/ResultsList';
import { trackEvent, AnalyticsActions } from './lib/analytics';

export default function Home() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    domain: null
  });
  const [mounted, setMounted] = useState(false);
  const [lastTrackedSearch, setLastTrackedSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Track page view
    trackEvent(AnalyticsActions.PAGE_VIEW, { page: 'home' });
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

  const trackSearch = useCallback((query) => {
    if (query && 
        query !== lastTrackedSearch && 
        query.length >= 2) {
      trackEvent(AnalyticsActions.SEARCH, { 
        query,
        results: activities.filter(a => 
          a.title?.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase())
        ).length
      });
      setLastTrackedSearch(query);
    }
  }, [activities, lastTrackedSearch]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to track the search after 500ms of no changes
    const timeout = setTimeout(() => {
      trackSearch(query);
    }, 500);

    setSearchTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleDomainFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, domain: newFilters.domain }));
    // Track filter application
    trackEvent(AnalyticsActions.FILTER_APPLY, { filters: newFilters });
  };

  const handleCategoryClick = (category) => {
    // Track category click
    trackEvent(AnalyticsActions.CATEGORY_CLICK, { category });
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
        onFilterChange={handleDomainFilterChange}
        onCategoryClick={handleCategoryClick}
      />
    </Box>
  );
}