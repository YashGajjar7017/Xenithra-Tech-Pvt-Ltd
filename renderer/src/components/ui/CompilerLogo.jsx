import React from 'react'
import GenZLogo from './GenZLogo'

const CompilerLogo = ({ size = 26, showText = true, textStyle = {} }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
      <GenZLogo size={size} showTooltip={!showText} />

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, ...textStyle }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.12em',
              background: 'linear-gradient(90deg, #00f3ff 0%, #a855f7 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
            }}
          >
            XENITHRA
          </span>
          <span
            style={{
              fontSize: '8.5px',
              letterSpacing: '0.2em',
              color: '#8b949e',
              fontWeight: 600,
              marginTop: '2px'
            }}
          >
            CYBER IDE
          </span>
        </div>
      )}
    </div>
  )
}

export default CompilerLogo

