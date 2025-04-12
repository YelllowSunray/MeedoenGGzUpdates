import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function ActivityCard({ activity }) {
  return (
    <Card style={{ marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '200px' }}>
      <CardContent style={{ padding: '16px' }}>
        <Typography variant="h6" component="div">
          {activity['What specific'] || activity['What']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>👥 Voor wie:</strong> {activity['For Who']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>📝 Beschrijving:</strong> {activity['Unnamed: 7']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>📍 Waar:</strong> {activity['Where']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>👤 Door wie:</strong> {activity['By who']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>🗓️ Wanneer:</strong> {activity['When']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>💰 Kosten:</strong> {activity['How much?']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>📞 Contact:</strong> {activity['Unnamed: 11']}
        </Typography>
        <Typography color="text.secondary" style={{ margin: '8px 0' }}>
          <strong>🏷️ Tags:</strong> {activity['Unnamed: 14']}
        </Typography>
      </CardContent>
    </Card>
  );
}