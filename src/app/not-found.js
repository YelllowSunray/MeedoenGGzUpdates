import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Pagina niet gevonden
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        De pagina die u zoekt bestaat niet of is verplaatst.
      </Typography>
      <Link href="/" passHref style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#8BA888',
            '&:hover': {
              backgroundColor: '#7A9778'
            }
          }}
        >
          Terug naar home
        </Button>
      </Link>
    </Container>
  );
} 