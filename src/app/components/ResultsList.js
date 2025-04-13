import ActivityCard from './ActivityCard';
import Box from '@mui/material/Box';
import { Alert, Typography, Paper } from '@mui/material';

export default function ResultsList({ activities, debug = false }) {
  if (!activities.length) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          bgcolor: 'white',
          maxWidth: '800px',
          mx: 'auto',
          textAlign: 'center'
        }}
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          Geen activiteiten gevonden. Probeer een andere zoekopdracht.
        </Alert>
        <Typography variant="body1">
          Dit kan gebeuren omdat:
        </Typography>
        <Box component="ul" sx={{ textAlign: 'left', mt: 1 }}>
          <Typography component="li">De gegevens nog worden geladen</Typography>
          <Typography component="li">Er geen verbinding is met de database</Typography>
          <Typography component="li">De zoekfilters te specifiek zijn</Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
          Probeer de pagina te vernieuwen of gebruik minder specifieke filters.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '20px',
      '& > div': {
        flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 10px)', md: '0 0 calc(33.33% - 14px)' }
      }
    }}>
      {activities.map((activity, index) => (
        <div key={index}>
          <ActivityCard activity={{ ...activity, debug: debug && index === 0 }} />
        </div>
      ))}
    </Box>
  );
}