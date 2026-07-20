import React from 'react'

const InlineSuggestOverlay = ({ ghostText = '', onAccept }) => {
  if (!ghostText) return null

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(0, 255, 170, 0.55)',
        fontStyle: 'italic',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '12px',
        userSelect: 'none',
        pointerEvents: 'none',
        marginLeft: '2px'
      }}
    >
      <span>{ghostText}</span>
      <span 
        style={{
          fontSize: '9px',
          fontStyle: 'normal',
          background: 'rgba(0, 255, 170, 0.15)',
          border: '1px solid rgba(0, 255, 170, 0.3)',
          color: '#00ffaa',
          padding: '1px 5px',
          borderRadius: '3px',
          fontWeight: 'bold',
          letterSpacing: '0.04em'
        }}
      >
        Tab ↹ Accept
      </span>
    </div>
  )
}

export default InlineSuggestOverlay
