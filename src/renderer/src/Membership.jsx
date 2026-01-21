
const Membership = () => {
  const plans = [
    { name: 'Basic', price: '$9.99', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    {
      name: 'Pro',
      price: '$19.99',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4']
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      features: ['All Features', 'Priority Support', 'Custom']
    }
  ]

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Membership Plans</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}
        >
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <h2>{plan.name}</h2>
              <div
                style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0', color: '#667eea' }}
              >
                {plan.price}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  padding: '12px 30px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Membership
