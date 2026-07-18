import { useState, useRef, useEffect } from 'react'

const Toolbar = ({ theme, setTheme }) => {
  const [selectedLang, setSelectedLang] = useState('Node.js')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const langDropdownRef = useRef(null)

  const languages = ['C (GCC)', 'C++ (G++)', 'Python 3', 'Node.js', 'XML', 'Dot Net', 'Dart', 'Next.js']

  // Sync language selection when changed elsewhere
  useEffect(() => {
    const handleLangSync = (e) => {
      if (e.detail && e.detail.language) {
        setSelectedLang(e.detail.language)
      }
    }
    window.addEventListener('change-language', handleLangSync)
    return () => window.removeEventListener('change-language', handleLangSync)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang)
    setDropdownOpen(false)
    window.dispatchEvent(new CustomEvent('change-language', { detail: { language: lang } }))
  }

  const runCode = () => window.dispatchEvent(new CustomEvent('menu-run-code'))
  const debugCode = () => window.dispatchEvent(new CustomEvent('menu-debug-code'))
  const formatCode = () => window.dispatchEvent(new CustomEvent('menu-format-code'))
  const stopCode = () => window.dispatchEvent(new CustomEvent('menu-stop-code'))
  const packageCode = () => window.dispatchEvent(new CustomEvent('menu-package-code'))
  const splitEditor = () => window.dispatchEvent(new CustomEvent('menu-split-editor'))

  return (
    <div className="toolbar" style={{
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      background: 'rgba(10, 16, 32, 0.45)',
      borderBottom: '1px solid var(--panel-border)',
      zIndex: 5,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Left: Section label/info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="bx bx-play-circle" style={{ color: 'var(--accent-color)', fontSize: '14px' }}></i>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Workspace Runner</span>
      </div>

      {/* Center: Primary Execution Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <button 
          onClick={runCode} 
          style={{
            background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '3px 10px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0, 230, 118, 0.2)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>▶</span> Run
        </button>

        <button 
          onClick={debugCode}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px',
            color: '#00e5ff',
            fontSize: '11px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '3px 8px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          🐞 Debug
        </button>

        <button 
          onClick={stopCode}
          style={{
            background: 'rgba(255,107,107,0.15)',
            border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: '4px',
            color: '#ff6b6b',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '3px 8px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ■ Stop
        </button>

        <span style={{ opacity: 0.3, color: '#fff', margin: '0 4px' }}>|</span>

        {/* Formatting & Utilities */}
        <button 
          onClick={formatCode}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '3px 8px',
            height: '22px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {`{ }`} Format Code
        </button>

        <button 
          onClick={packageCode}
          title="Compile and download standalone binary file"
          style={{
            background: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '4px',
            color: '#00e5ff',
            fontSize: '11px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '3px 8px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          📦 Package Binary
        </button>

        <span style={{ opacity: 0.3, color: '#fff', margin: '0 4px' }}>|</span>

        {/* Sideways Editor Layout Control */}
        <button 
          onClick={splitEditor}
          title="Toggle Sideways Split Screen Editors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px',
            color: 'var(--text-main)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '3px 8px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          || Split Editor
        </button>
      </div>

      {/* Right: Language Selector Dropdown on the Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div ref={langDropdownRef} className="lang-select" style={{ fontSize: '11px', gap: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span>Environment:</span>
          <div className={`dropdown ${dropdownOpen ? 'open' : ''}`} style={{ position: 'relative' }}>
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)} style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}>
              <span>{selectedLang}</span>
              <span className="arrow" style={{ marginLeft: '4px' }}>▾</span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu" style={{
                position: 'absolute',
                top: '26px',
                right: 0,
                background: 'rgba(10, 16, 32, 0.95)',
                border: '1px solid var(--panel-border)',
                borderRadius: '6px',
                minWidth: '120px',
                padding: '4px 0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 20
              }}>
                {languages.map((lang) => (
                  <button key={lang} onClick={() => handleLanguageSelect(lang)} style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    fontSize: '11px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }} onMouseEnter={(e) => e.target.style.background = 'rgba(0, 229, 255, 0.15)'}
                     onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
