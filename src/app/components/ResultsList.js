'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, useTheme, useMediaQuery, Typography } from '@mui/material';
import { searchAndFilter } from '../lib/search';
import ActivityCard from './ActivityCard';

export default function ResultsList({ activities, searchQuery, filters }) {
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isClient, setIsClient] = useState(false);
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
      console.log('Filtered activities:', results.length);
    }
  }, [activities, searchQuery, filters, isClient]);

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

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      px: 2,
      display: 'flex',
      justifyContent: 'center'
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
        {filteredActivities.map((activity, index) => (
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
    </Box>
  );
}