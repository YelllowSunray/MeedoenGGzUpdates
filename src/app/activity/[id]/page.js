'use client';
import { Container, Paper, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ActivityDetails({ params }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get activity details from sessionStorage
    const storedActivity = sessionStorage.getItem('activityDetails');
    if (storedActivity) {
      setActivity(JSON.parse(storedActivity));
    }
    setLoading(false);

    // Restore scroll position when returning to main page
    const handleBeforeUnload = () => {
      const scrollPosition = sessionStorage.getItem('scrollPosition');
      if (scrollPosition) {
        sessionStorage.setItem('shouldRestore', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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

  if (loading) {
    return (
      <Container>
        <Typography>Laden...</Typography>
      </Container>
    );
  }

  if (!activity) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Activiteit niet gevonden
        </Typography>
        <Button component={Link} href="/" variant="contained">
          Terug naar overzicht
        </Button>
      </Container>
    );
  }

  const title = getField(['Activity name', 'Activiteit', 'What specific', 'Title', 'Titel']) || 
               getField(['Activity type', 'What', 'Activiteit long']) || 
               'Onbekende activiteit';

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Algemene informatie
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>👤 Door wie:</strong> {getField(['organisatie', 'By who', 'Door wie', 'Organizer'])}
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>📍 Waar:</strong> {getField(['Address', 'Where', 'Waar', 'Location'])}
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>👥 Voor wie:</strong> {getField(['For Who', 'Doelgroep', 'Target audience'])}
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>🗓️ Wanneer:</strong> {getField(['Wanneer? Hoe laat?', 'When', 'Wanneer', 'Date', 'Datum'])}
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>💰 Kosten:</strong> {getField(['How much?', 'Kosten', 'Price', 'Prijs'])}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Beschrijving
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          {getField(['Beschrijving', 'Unnamed: 7', 'Description'])}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Contact informatie
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>📞 Contact:</strong> {getField(['Contact', 'Contact info', 'Contactgegevens'])}
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          <strong>🔗 Website:</strong> {getField(['website', 'Link', 'URL'])}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Tags
        </Typography>
        <Typography paragraph sx={{ mb: 2 }}>
          {getField(['Tags', 'Categorieën', 'Categories'])}
        </Typography>

        <Button 
          component={Link} 
          href="/" 
          variant="contained" 
          sx={{ mt: 2 }}
        >
          Terug naar overzicht
        </Button>
      </Paper>
    </Container>
  );
} 