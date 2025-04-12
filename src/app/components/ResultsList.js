import ActivityCard from './ActivityCard';
import Box from '@mui/material/Box';

export default function ResultsList({ activities, debug = false }) {
  if (!activities.length) {
    return <p>Geen activiteiten gevonden. Probeer een andere zoekopdracht.</p>;
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