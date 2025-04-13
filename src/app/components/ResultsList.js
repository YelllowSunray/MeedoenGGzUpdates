'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, useTheme, useMediaQuery, Typography, Button } from '@mui/material';
import { searchAndFilter } from '../lib/search';
import ActivityCard from './ActivityCard';

export default function ResultsList({ activities, searchQuery, filters }) {
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [displayedActivities, setDisplayedActivities] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const results = searchAndFilter(activities, searchQuery, filters);
      setFilteredActivities(results);
      setPage(1); // Reset page when search or filters change
      setDisplayedActivities(results.slice(0, itemsPerPage));
    }
  }, [activities, searchQuery, filters, isClient]);

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = 0;
    const endIndex = nextPage * itemsPerPage;
    setDisplayedActivities(filteredActivities.slice(0, endIndex));
    setPage(nextPage);
  };

  if (!isClient) {
    return null;
  }

  if (!filteredActivities.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Geen activiteiten gevonden
        </Typography>
      </Box>
    );
  }

  const hasMore = displayedActivities.length < filteredActivities.length;

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      px: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          maxWidth: '1000px',
          margin: '0 auto',
          justifyContent: 'center'
        }}
      >
        {displayedActivities.map((activity, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={`${activity['Activity name']}-${index}`}
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ width: '100%', maxWidth: '300px' }}>
              <ActivityCard activity={activity} />
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {hasMore && (
        <Button
          variant="contained"
          onClick={loadMore}
          sx={{
            mt: 4,
            mb: 2,
            px: 4,
            py: 1.5,
            borderRadius: '30px',
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Laad meer activiteiten
        </Button>
      )}
    </Box>
  );
}