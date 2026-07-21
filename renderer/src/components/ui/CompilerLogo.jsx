import React from 'react'

const CompilerLogo = ({ size = 28, showText = true, textStyle = {} }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      <div 
        style={{ 
          position: 'relative', 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {/* Glow backdrop ring */}
        <div 
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 255, 170, 0.4) 0%, rgba(88, 166, 255, 0.2) 60%, transparent 100%)',
            filter: 'blur(4px)',
            animation: 'pulseGlow 3s infinite alternate'
          }}
        />

        {/* Core App Logo Image Emblem with Electron Atom fallback */}
        <img 
          src="/Images/app_logo.png" 
          alt="Xenithra App Logo"
          onError={(e) => {
            e.target.style.display = 'none'
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'
          }}
          style={{ 
            position: 'relative', 
            zIndex: 2, 
            width: `${size}px`, 
            height: `${size}px`, 
            borderRadius: '6px',
            objectFit: 'cover' 
          }} 
        />
        <svg 
          viewBox="0 0 24 24" 
          width={size} 
          height={size} 
          style={{ display: 'none', position: 'relative', zIndex: 2 }}
        >
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(-30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#00e5ff" strokeWidth="1.5" transform="rotate(90 12 12)" />
          <circle cx="12" cy="12" r="2.5" fill="#00ffaa" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, ...textStyle }}>
          <span 
            style={{ 
              fontWeight: 800, 
              fontSize: '13px', 
              letterSpacing: '0.12em',
              background: 'linear-gradient(90deg, #00ffaa 0%, #00bfff 50%, #d8b4fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Inter', system-ui, sans-serif"
            }}
          >
            XENITHRA
          </span>
          <span 
            style={{ 
              fontSize: '9px', 
              letterSpacing: '0.22em', 
              color: '#8b949e', 
              fontWeight: 600,
              marginTop: '2px'
            }}
          >
            COMPILER IDE
          </span>
        </div>
      )}
    </div>
  )
}

export default CompilerLogo
