import React from 'react'

/**
 * GenZLogo — Authentic Xenithra IDE Brand Mark
 * Displays the official Xenithra logo with sleek glow and hover scaling.
 */
const GenZLogo = ({ size = 26, showTooltip = true, onClick }) => {
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
      <img
        src="/Images/Logo_Xenithra.png"
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
          e.currentTarget.src = '/Images/app_logo.png'
        }}
      />
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
