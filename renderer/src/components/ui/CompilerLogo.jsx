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

        {/* Core SVG Compiler Emblem */}
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <defs>
            <linearGradient id="xenithraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffaa" />
              <stop offset="50%" stopColor="#00bfff" />
              <stop offset="100%" stopColor="#8a2be2" />
            </linearGradient>
            <linearGradient id="xenithraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff007f" />
              <stop offset="100%" stopColor="#00ffaa" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Octagonal/Hex Compiler Frame */}
          <path 
            d="M 12 4 L 28 4 L 36 12 L 36 28 L 28 36 L 12 36 L 4 28 L 4 12 Z" 
            fill="rgba(15, 23, 42, 0.85)" 
            stroke="url(#xenithraGrad1)" 
            strokeWidth="2"
          />

          {/* Compiler Chip Core */}
          <rect x="13" y="13" width="14" height="14" rx="3" fill="#0d1117" stroke="url(#xenithraGrad2)" strokeWidth="1.5" />
          
          {/* Stylized X & Code Brackets in Core */}
          <path d="M 16 16 L 24 24 M 24 16 L 16 24" stroke="#00ffaa" strokeWidth="2" strokeLinecap="round" filter="url(#neonGlow)" />

          {/* Compiler Pin Traces */}
          <line x1="20" y1="4" x2="20" y2="10" stroke="#00ffaa" strokeWidth="1.5" strokeDasharray="1 1" />
          <line x1="20" y1="30" x2="20" y2="36" stroke="#00ffaa" strokeWidth="1.5" strokeDasharray="1 1" />
          <line x1="4" y1="20" x2="10" y2="20" stroke="#00bfff" strokeWidth="1.5" strokeDasharray="1 1" />
          <line x1="30" y1="20" x2="36" y2="20" stroke="#00bfff" strokeWidth="1.5" strokeDasharray="1 1" />

          {/* Glowing Nodes */}
          <circle cx="20" cy="20" r="2.5" fill="#ffffff" filter="url(#neonGlow)" />
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
