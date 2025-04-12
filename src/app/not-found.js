'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error('Page not found');
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Pagina niet gevonden
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        De pagina die u zoekt bestaat niet of is verplaatst.
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push('/')}
        sx={{
          backgroundColor: '#8BA888',
          '&:hover': {
            backgroundColor: '#7A9778'
          }
        }}
      >
        Terug naar home
      </Button>
    </Container>
  );
} 