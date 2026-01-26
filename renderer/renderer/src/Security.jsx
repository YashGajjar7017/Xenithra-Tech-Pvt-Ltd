
const Security = () => {
  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Security Settings</h1>
        <div
          style={{ background: 'white', padding: '30px', borderRadius: '8px', marginTop: '20px' }}
        >
          <h2>Change Password</h2>
          <form>
            <div style={{ marginBottom: '15px' }}>
              <label>Current Password:</label>
              <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>New Password:</label>
              <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Confirm Password:</label>
              <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Update Password
            </button>
          </form>
        </div>

        <div
          style={{ background: 'white', padding: '30px', borderRadius: '8px', marginTop: '20px' }}
        >
          <h2>Two-Factor Authentication</h2>
          <p>Enable two-factor authentication for additional security.</p>
          <button
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  )
}

export default Security
