'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Typography, Button } from '@mui/material';

export default function ActivityCard({ activity }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe getter for activity fields - try multiple possible field names
  const getField = (fields, fallback = '') => {
    if (!activity) return fallback;
    
    // Try all provided field names
    for (const field of fields) {
      if (activity[field]) return activity[field];
    }
    
    return fallback;
  };

  // Determine title with fallbacks
  const title = getField(['Activity name', 'Activiteit', 'What specific', 'Title', 'Titel']) || 
               getField(['Activity type', 'What', 'Activiteit long']) || 
               'Onbekende activiteit';

  const handleViewDetails = () => {
    // Save scroll position
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    
    // Save activity details
    sessionStorage.setItem('activityDetails', JSON.stringify(activity));

    // Get the activity title for the URL
    const title = getField(['Activity name', 'Activiteit', 'What specific', 'Title', 'Titel']) || 
                 getField(['Activity type', 'What', 'Activiteit long']) || 
                 'unknown';
    const encodedTitle = encodeURIComponent(title);
    
    // Navigate to details page
    router.push(`/activity/${encodedTitle}`);
  };

  if (!mounted) {
    return null; // Don't render anything until mounted
  }

  return (
    <Card style={{ 
      marginBottom: '10px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      height: '350px', // Increased from 300px to 400px
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent style={{ 
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // Hide overflow
      }}>
        <Typography variant="h6" component="div" gutterBottom style={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {title}
        </Typography>
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          marginBottom: '16px'
        }}>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>👤</strong> {getField(['organisatie', 'By who', 'Door wie', 'Organizer'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>📍</strong> {getField(['Address', 'Where', 'Waar', 'Location'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>🗓️</strong> {getField(['Wanneer? Hoe laat?', 'When', 'Wanneer', 'Date', 'Datum'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>📝</strong> {getField(['Beschrijving', 'Unnamed: 7', 'Description'])}
          </Typography>
        </div>
        <Button 
          variant="contained" 
          onClick={handleViewDetails}
          style={{ marginTop: 'auto' }} // Push button to bottom
        >
          Bekijk details
        </Button>
      </CardContent>
    </Card>
  );
}