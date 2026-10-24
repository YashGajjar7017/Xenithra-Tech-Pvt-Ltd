import React from 'react'

/**
 * GenZLogo — Authentic Xenithra IDE Brand Mark
 * Displays the official Xenithra logo with sleek glow and hover scaling.
 */
const GenZLogo = ({ size = 26, showTooltip = true, onClick }) => {
  const [imgError, setImgError] = React.useState(false)
  const s = size

  return (
    <div
      className="xn-logo-wrap"
      onClick={onClick}
      title={showTooltip ? 'Xenithra Code Studio' : undefined}
      style={{
        position: 'relative',
        width: `${s}px`,
        height: `${s}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      {!imgError ? (
        <img
          src="./Images/Logo_Xenithra.png"
          alt="Xenithra Logo"
          className="xn-logo-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 0 5px rgba(0, 200, 255, 0.5))',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease'
          }}
          onError={(e) => {
            e.currentTarget.onerror = null
            setImgError(true)
          }}
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          width={s}
          height={s}
          className="xn-logo-img"
          style={{
            display: 'block',
            filter: 'drop-shadow(0 0 6px rgba(0, 243, 255, 0.65)) drop-shadow(0 0 12px rgba(139, 92, 246, 0.45))',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <defs>
            <linearGradient id="xnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
            <linearGradient id="xnCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          {/* Rounded Hexagon Shield */}
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="7"
            fill="#0f172a"
            stroke="url(#xnGrad)"
            strokeWidth="1.8"
          />
          {/* Stylized Cyber X Mark */}
          <path
            d="M9 9 L14 16 L9 23 L12.5 23 L16 18 L19.5 23 L23 23 L18 16 L23 9 L19.5 9 L16 14 L12.5 9 Z"
            fill="url(#xnCoreGrad)"
          />
          {/* Energy core diamond */}
          <polygon points="16,13.5 17.8,16 16,18.5 14.2,16" fill="#00f3ff" />
        </svg>
      )}
    </div>
  )
}

// Inject hover effect via CSS class
if (typeof document !== 'undefined' && !document.getElementById('xn-logo-styles')) {
  const css = `
    .xn-logo-wrap:hover .xn-logo-img {
      transform: scale(1.15);
      filter: drop-shadow(0 0 8px rgba(0, 243, 255, 0.85)) drop-shadow(0 0 14px rgba(124, 58, 237, 0.6));
    }
  `
  const style = document.createElement('style')
  style.id = 'xn-logo-styles'
  style.textContent = css
  ;(document.head || document.getElementsByTagName('head')[0]).appendChild(style)
}

export default GenZLogo
