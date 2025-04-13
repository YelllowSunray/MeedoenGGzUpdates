import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ActivityCard({ activity }) {
  const router = useRouter();

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
    // Store the full activity data in sessionStorage
    sessionStorage.setItem('activityDetails', JSON.stringify(activity));
    // Save current scroll position in history state
    window.history.replaceState(
      { ...window.history.state, scrollPosition: window.scrollY },
      ''
    );
    // Navigate to the details page
    router.push(`/activiteit/${encodeURIComponent(title)}`);
  };

  return (
    <Card style={{ 
      marginBottom: '10px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      height: '300px', // Fixed height
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
            <strong>👤 Door wie:</strong> {getField(['organisatie', 'By who', 'Door wie', 'Organizer'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>📍 Waar:</strong> {getField(['Address', 'Where', 'Waar', 'Location'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>📝 Beschrijving:</strong> {getField(['Beschrijving', 'Unnamed: 7', 'Description'])}
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