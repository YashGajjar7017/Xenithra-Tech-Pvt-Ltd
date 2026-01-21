const Maintenance = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '40px'
      }}>
        <h1 style={{ fontSize: '72px', marginBottom: '20px' }}>ðŸ”§</h1>
        <h2>Maintenance Mode</h2>
        <p style={{ fontSize: '18px', marginTop: '20px' }}>
          We're currently maintaining our system. Please check back soon!
        </p>
        <a href="/" style={{
          marginTop: '30px',
          display: 'inline-block',
          padding: '12px 30px',
          background: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          Go Back to Home
        </a>
      </div>
    </div>
  )
}

export default Maintenance