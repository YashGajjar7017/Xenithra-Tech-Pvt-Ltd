import React, { useState, useEffect, useRef } from 'react'

const languagesList = [
  { id: 'Node.js', label: 'Node.js (V8)', extensions: ['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx'] },
  { id: 'Python 3', label: 'Python 3.11', extensions: ['py', 'pyw', 'ipynb'] },
  { id: 'C (GCC)', label: 'C (GCC 13)', extensions: ['c', 'h'] },
  { id: 'C++ (G++)', label: 'C++ (G++ 20)', extensions: ['cpp', 'cc', 'cxx', 'hpp'] },
  { id: 'Dot Net', label: 'C# / .NET 8', extensions: ['cs', 'csproj'] },
  { id: 'Dart', label: 'Dart SDK', extensions: ['dart'] },
  { id: 'Next.js', label: 'Next.js 15 (React)', extensions: ['jsx', 'tsx'] },
  { id: 'PHP', label: 'PHP 8.3 (XAMPP)', extensions: ['php', 'phtml'] },
  { id: 'MySQL', label: 'MySQL / SQL DB', extensions: ['sql'] },
  { id: 'XML', label: 'HTML5 / XML', extensions: ['html', 'htm', 'xml', 'svg'] }
]

const FooterEnvSelector = () => {
  const [currentLang, setCurrentLang] = useState('Node.js')
  const [isAuto, setIsAuto] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Auto-detect language based on active file
  useEffect(() => {
    const handleOpenFile = (e) => {
      if (!isAuto) return
      const filename = e.detail?.filename || e.detail?.path || ''
      if (!filename) return

      const ext = filename.split('.').pop().toLowerCase()
      const matched = languagesList.find((item) => item.extensions.includes(ext))
      if (matched) {
        setCurrentLang(matched.id)
        window.dispatchEvent(
          new CustomEvent('change-language', { detail: { language: matched.id } })
        )
      }
    }

    const handleManualLangChange = (e) => {
      if (e.detail && e.detail.language && e.detail.source !== 'footer') {
        setCurrentLang(e.detail.language)
      }
    }

    window.addEventListener('open-file', handleOpenFile)
    window.addEventListener('change-language', handleManualLangChange)

    return () => {
      window.removeEventListener('open-file', handleOpenFile)
      window.removeEventListener('change-language', handleManualLangChange)
    }
  }, [isAuto])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (langId, autoMode = false) => {
    setCurrentLang(langId)
    setIsAuto(autoMode)
    setIsOpen(false)
    window.dispatchEvent(
      new CustomEvent('change-language', { detail: { language: langId, source: 'footer' } })
    )

    if (langId === 'PHP' || langId === 'MySQL') {
      if (window.api && typeof window.api.startXamppService === 'function') {
        window.api.startXamppService('php').then(() => {
          window.api.startXamppService('mysql')
        })
      }
    }
  }

  const activeObj = languagesList.find((l) => l.id === currentLang) || {
    id: currentLang,
    label: currentLang
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Runtime Environment (Click to switch or toggle Auto-Select)"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-main)',
          fontSize: '11px',
          fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 8px',
          borderRadius: '4px',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isAuto ? '#00ffaa' : '#00b0ff',
            boxShadow: isAuto ? '0 0 6px #00ffaa' : '0 0 6px #00b0ff'
          }}
        />
        <span style={{ fontWeight: '600' }}>{activeObj.label || activeObj.id}</span>
        {isAuto && (
          <span
            style={{
              fontSize: '9px',
              color: '#00ffaa',
              background: 'rgba(0, 255, 170, 0.12)',
              padding: '1px 4px',
              borderRadius: '3px',
              fontWeight: '700',
              letterSpacing: '0.04em'
            }}
          >
            AUTO
          </span>
        )}
        <span style={{ opacity: 0.6, fontSize: '9px' }}>▾</span>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '26px',
            right: 0,
            background: '#161b22',
            border: '1px solid var(--panel-border)',
            borderRadius: '8px',
            width: '210px',
            padding: '6px 0',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.6)',
            zIndex: 99999,
            fontSize: '11px',
            color: '#c9d1d9'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '4px 12px 6px',
              fontSize: '10px',
              fontWeight: '700',
              color: '#8b949e',
              letterSpacing: '0.08em',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>RUNTIME ENVIRONMENT</span>
            <button
              onClick={() => setIsAuto(!isAuto)}
              style={{
                background: isAuto ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: isAuto ? '1px solid #00ffaa' : '1px solid rgba(255,255,255,0.15)',
                color: isAuto ? '#00ffaa' : '#888',
                borderRadius: '3px',
                fontSize: '9px',
                padding: '1px 5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isAuto ? 'Auto: ON' : 'Auto: OFF'}
            </button>
          </div>

          <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '4px 0' }}>
            {languagesList.map((lang) => {
              const isSelected = currentLang === lang.id
              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelect(lang.id, false)}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: isSelected ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                    color: isSelected ? '#00f3ff' : 'var(--text-main)',
                    fontWeight: isSelected ? '700' : 'normal',
                    textAlign: 'left',
                    fontSize: '11px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span>{lang.label}</span>
                  {isSelected && <span style={{ color: '#00f3ff' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FooterEnvSelector
