import React from 'react'

const GenZLogo = ({ size = 26, showTooltip = true, onClick }) => {
  return (
    <div
      className="genz-logo-container"
      onClick={onClick}
      title={showTooltip ? 'Xenithra Cyber Matrix Engine v2.0' : undefined}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {/* Ambient Neon Back-Glow */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(0, 243, 255, 0.45) 0%, rgba(168, 85, 247, 0.35) 45%, rgba(16, 185, 129, 0.2) 75%, transparent 100%)',
          filter: 'blur(6px)',
          animation: 'genZPulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
          pointerEvents: 'none'
        }}
      />

      {/* Cyber Rotating Ring */}
      <svg
        viewBox="0 0 48 48"
        width={size + 6}
        height={size + 6}
        style={{
          position: 'absolute',
          inset: -3,
          animation: 'genZSpin 12s linear infinite',
          pointerEvents: 'none',
          opacity: 0.85
        }}
      >
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="1.8"
          strokeDasharray="4 6 12 4"
        />
      </svg>

      {/* Core Futuristic Geometric Neural Prism Emblem */}
      <svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        style={{
          position: 'relative',
          zIndex: 2,
          filter: 'drop-shadow(0 0 6px rgba(0, 243, 255, 0.6))',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        className="genz-logo-svg"
      >
        <defs>
          <linearGradient id="prismGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="60%" stopColor="#0088ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="prismGradB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="prismCore" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon / Shield Frame */}
        <polygon
          points="18,3 32,10 32,26 18,33 4,26 4,10"
          fill="rgba(10, 15, 30, 0.85)"
          stroke="url(#prismGradA)"
          strokeWidth="1.5"
        />

        {/* Stylized 'X' / Quantum Neural Node */}
        {/* Left-top to Right-bottom beam */}
        <path
          d="M10,11 L26,25"
          stroke="url(#prismGradA)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Right-top to Left-bottom beam */}
        <path
          d="M26,11 L10,25"
          stroke="url(#prismGradB)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Central Glowing Diamond Core */}
        <polygon
          points="18,14 22,18 18,22 14,18"
          fill="url(#prismCore)"
          style={{ filter: 'drop-shadow(0 0 4px #00f3ff)' }}
        />

        {/* Quantum Orbital Nodes */}
        <circle cx="18" cy="6" r="1.5" fill="#00f3ff" />
        <circle cx="29" cy="18" r="1.5" fill="#a855f7" />
        <circle cx="18" cy="30" r="1.5" fill="#10b981" />
        <circle cx="7" cy="18" r="1.5" fill="#ec4899" />
      </svg>
    </div>
  )
}

// Active styling tags injection
if (typeof document !== 'undefined' && !document.getElementById('genz-logo-styles')) {
  const css = `
    @keyframes genZPulse {
      0% { transform: scale(0.92); opacity: 0.6; }
      100% { transform: scale(1.15); opacity: 1; }
    }
    @keyframes genZSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .genz-logo-container:hover .genz-logo-svg {
      transform: scale(1.18) rotate(15deg);
      filter: drop-shadow(0 0 10px rgba(0, 243, 255, 0.95)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.8));
    }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.id = 'genz-logo-styles'
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

export default GenZLogo
