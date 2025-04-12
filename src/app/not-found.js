import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '600px', 
      margin: '0 auto', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        Pagina niet gevonden
      </h1>
      <p style={{ 
        fontSize: '16px', 
        color: '#666', 
        marginBottom: '24px' 
      }}>
        De pagina die u zoekt bestaat niet of is verplaatst.
      </p>
      <Link href="/" style={{ 
        display: 'inline-block',
        background: '#8BA888', 
        color: 'white', 
        padding: '10px 20px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}>
        Terug naar home
      </Link>
    </div>
  );
} 