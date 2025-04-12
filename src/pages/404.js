export default function Custom404() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1>Pagina niet gevonden</h1>
      <p>De pagina die u zoekt bestaat niet of is verplaatst.</p>
      <a href="/" style={{ 
        display: 'inline-block',
        background: '#8BA888', 
        color: 'white', 
        padding: '10px 20px',
        borderRadius: '4px',
        textDecoration: 'none',
        marginTop: '20px'
      }}>
        Terug naar home
      </a>
    </div>
  );
} 