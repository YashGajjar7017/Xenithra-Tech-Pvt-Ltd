import React from 'react'

/**
 * XenithraLogo — Premium IDE icon mark, inspired by VSCode / JetBrains style.
 * Single, clean geometric shape: angular "X" inside a rounded-rect shield.
 * Subtle glow + hover scale. No spinning parts — reads perfectly at small sizes.
 */
const GenZLogo = ({ size = 26, showTooltip = true, onClick }) => {
  const s = size
  return (
    <div
      className="xn-logo-wrap"
      onClick={onClick}
      title={showTooltip ? 'Xenithra Code Studio v2.0' : undefined}
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
      <svg
        viewBox="0 0 32 32"
        width={s}
        height={s}
        className="xn-logo-svg"
        style={{
          display: 'block',
          filter: 'drop-shadow(0 0 5px rgba(0,200,255,0.55))',
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), filter 0.22s ease'
        }}
        aria-label="Xenithra IDE"
      >
        <defs>
          {/* Main blue-to-purple gradient */}
          <linearGradient id="xnGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="55%" stopColor="#4f8fff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          {/* Accent / highlight gradient */}
          <linearGradient id="xnGradAccent" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
          </linearGradient>
          {/* Soft inner fill */}
          <linearGradient id="xnGradFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#050c1a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0a1530" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* ── Rounded-rect shield body ── */}
        <rect
          x="2" y="2" width="28" height="28"
          rx="7" ry="7"
          fill="url(#xnGradFill)"
          stroke="url(#xnGradMain)"
          strokeWidth="1.6"
        />

        {/* ── Top-left highlight rim (like VSCode icon specular) ── */}
        <rect
          x="2" y="2" width="28" height="8"
          rx="7" ry="7"
          fill="rgba(255,255,255,0.05)"
        />

        {/* ── Bold "X" mark — left-top → right-bottom ── */}
        <line
          x1="9" y1="9" x2="23" y2="23"
          stroke="url(#xnGradMain)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* ── Bold "X" mark — right-top → left-bottom ── */}
        <line
          x1="23" y1="9" x2="9" y2="23"
          stroke="url(#xnGradAccent)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* ── Central diamond node ── */}
        <polygon
          points="16,12.5 19,16 16,19.5 13,16"
          fill="#0a1530"
          stroke="url(#xnGradMain)"
          strokeWidth="1"
        />
        {/* ── Bright centre dot ── */}
        <circle cx="16" cy="16" r="1.8" fill="#00d4ff" />
      </svg>
    </div>
  )
}

// Inject once — hover effect via CSS class
if (typeof document !== 'undefined' && !document.getElementById('xn-logo-styles')) {
  const css = `
    .xn-logo-wrap:hover .xn-logo-svg {
      transform: scale(1.14);
      filter: drop-shadow(0 0 9px rgba(0,200,255,0.85)) drop-shadow(0 0 16px rgba(168,85,247,0.6));
    }
  `
  const style = document.createElement('style')
  style.id = 'xn-logo-styles'
  style.textContent = css
  ;(document.head || document.getElementsByTagName('head')[0]).appendChild(style)
}

export default GenZLogo
