'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function ActivityDetails() {
  const router = useRouter();
  const params = useParams();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    // Get the activity data from sessionStorage
    const activityData = sessionStorage.getItem('activityDetails');
    if (activityData) {
      setActivity(JSON.parse(activityData));
    }
  }, []);

  if (!activity) {
    return <div>Loading...</div>;
  }

  // Safe getter for activity fields
  const getField = (fields, fallback = '') => {
    for (const field of fields) {
      if (activity[field]) return activity[field];
    }
    return fallback;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Button 
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        style={{ marginBottom: '20px' }}
      >
        Terug
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {getField(['Activity name', 'Activiteit', 'What specific', 'Title', 'Titel']) || 
             getField(['Activity type', 'What', 'Activiteit long']) || 
             'Onbekende activiteit'}
          </Typography>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Algemene informatie
          </Typography>
          
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>👤 Door wie:</strong> {getField(['organisatie', 'By who', 'Door wie', 'Organizer'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>📍 Waar:</strong> {getField(['Address', 'Where', 'Waar', 'Location'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>👥 Voor wie:</strong> {getField(['Doelgroep', 'For Who', 'Voor wie', 'Target audience'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>🗓️ Wanneer:</strong> {getField(['Wanneer? Hoe laat?', 'When', 'Wanneer', 'Date'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>💰 Kosten:</strong> {getField(['Kosten', 'How much?', 'Price'])}
          </Typography>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Beschrijving
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            {getField(['Beschrijving', 'Unnamed: 7', 'Description'])}
          </Typography>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Contact informatie
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>📞 Contact:</strong> {getField(['Contact', 'Unnamed: 11', 'Contactgegevens'])}
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            <strong>🔗 Website:</strong> {getField(['website', 'Website', 'URL'])}
          </Typography>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
            Tags
          </Typography>
          <Typography color="text.secondary" style={{ margin: '8px 0' }}>
            {getField(['Tags', 'Unnamed: 14', 'Keywords'])}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
} 