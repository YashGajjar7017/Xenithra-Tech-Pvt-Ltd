import 'bootstrap/dist/css/bootstrap.min.css'
import './navbar-glassy.css' // if you actually use that elsewhere

const RoleErrorPage = () => {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        background: '#f4f6f8',
        color: '#222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}
    >
      <div
        className="card"
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 6px 18px rgba(20,20,20,0.08)',
          maxWidth: '520px'
        }}
      >
        <h2>Missing or unknown role</h2>
        <p>
          We could not determine your account role. Please sign in again or use the test user to
          continue.
        </p>
        <div className="actions" style={{ marginTop: '18px' }}>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = '/Account/login')}
            style={{ padding: '8px 14px', borderRadius: '6px' }}
          >
            Sign in
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => (window.location.href = '/Account/signup?as=testuser')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              marginLeft: '8px'
            }}
          >
            Sign in as test user
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleErrorPage
