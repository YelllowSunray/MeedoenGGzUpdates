import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function ActivityCard({ activity }) {
  // Safe getter for activity fields - try multiple possible field names
  const getField = (fields, fallback = '') => {
    if (!activity) return fallback;
    
    // Try all provided field names
    for (const field of fields) {
      if (activity[field]) return activity[field];
    }
    
    return fallback;
  };

  // Determine title with fallbacks - use exact field names as in the original data structure
  const title = getField(['Activity name', 'Activiteit', 'What specific', 'Title', 'Titel']) || 
               getField(['Activity type', 'What', 'Activiteit long']) || 
               'Onbekende activiteit';

  return (
    <Card style={{ marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '200px' }}>
      <CardContent style={{ padding: '16px' }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>👥 Voor wie:</strong> {getField(['Doelgroep', 'For Who', 'Voor wie', 'Target audience'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>📝 Beschrijving:</strong> {getField(['Beschrijving', 'Unnamed: 7', 'Description'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>📍 Waar:</strong> {getField(['Address', 'Where', 'Waar', 'Location'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>👤 Door wie:</strong> {getField(['organisatie', 'By who', 'Door wie', 'Organizer'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>🗓️ Wanneer:</strong> {getField(['Wanneer? Hoe laat?', 'When', 'Wanneer', 'Date'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>💰 Kosten:</strong> {getField(['Kosten', 'How much?', 'Price'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>📞 Contact:</strong> {getField(['Contact', 'Unnamed: 11', 'Contactgegevens'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>🔗 Website:</strong> {getField(['website', 'Website', 'URL'])}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>🏷️ Tags:</strong> {getField(['Tags', 'Unnamed: 14', 'Keywords'])}
        </Typography>
        {activity && activity.debug && (
          <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px' }}>
            <div><strong>Debug info:</strong></div>
            <div style={{ overflow: 'auto', maxHeight: '100px' }}>
              {Object.keys(activity).map(key => (
                <div key={key} style={{ margin: '2px 0' }}>
                  <strong>{key}:</strong> {typeof activity[key] === 'object' ? JSON.stringify(activity[key]) : String(activity[key] || '')}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}