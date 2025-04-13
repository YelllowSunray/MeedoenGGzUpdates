'use client';

import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#00B4B4',
        color: 'white',
        py: 3,
        mt: 'auto',
        width: '100%',
        textAlign: 'center'
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Meedoen. Alle rechten voorbehouden.
      </Typography>
    </Box>
  );
} 