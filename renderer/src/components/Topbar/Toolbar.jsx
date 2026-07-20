import { useState, useRef, useEffect } from 'react'
import CompilerLogo from '../ui/CompilerLogo'

const Toolbar = ({ theme, setTheme }) => {
  const [selectedLang, setSelectedLang] = useState('Node.js')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLiveServerRunning, setIsLiveServerRunning] = useState(false)
  const [liveServerPort, setLiveServerPort] = useState(5500)
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

  // Check initial Live Server status
  useEffect(() => {
    if (window.api && typeof window.api.getLiveServerStatus === 'function') {
      window.api.getLiveServerStatus().then(status => {
        if (status) {
          setIsLiveServerRunning(status.running)
          if (status.port) setLiveServerPort(status.port)
        }
      }).catch(e => {})
    }
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

  const toggleLiveServer = async () => {
    if (!window.api || typeof window.api.startLiveServer !== 'function') return
    if (isLiveServerRunning) {
      await window.api.stopLiveServer()
      setIsLiveServerRunning(false)
    } else {
      const activeWorkspacePath = localStorage.getItem('activeWorkspacePath') || ''
      try {
        const res = await window.api.startLiveServer(activeWorkspacePath, 5500)
        if (res && res.success) {
          setIsLiveServerRunning(true)
          setLiveServerPort(res.port)
          window.open(res.url, '_blank')
        } else {
          alert(`Live Server status: ${res ? res.message : 'Starting server...'}`)
        }
      } catch (err) {
        console.error('Live Server error:', err)
      }
    }
  }

  const runCode = () => window.dispatchEvent(new CustomEvent('menu-run-code'))
  const debugCode = () => window.dispatchEvent(new CustomEvent('menu-debug-code'))
  const formatCode = () => window.dispatchEvent(new CustomEvent('menu-format-code'))
  const stopCode = () => window.dispatchEvent(new CustomEvent('menu-stop-code'))
  const packageCode = () => window.dispatchEvent(new CustomEvent('menu-package-code'))
  const splitEditor = () => window.dispatchEvent(new CustomEvent('menu-split-editor'))

  return (
    <div className="toolbar" style={{
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      background: 'rgba(10, 16, 32, 0.65)',
      borderBottom: '1px solid var(--panel-border)',
      zIndex: 5,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Left: Compiler Brand Logo & Runner label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CompilerLogo size={22} showText={true} textStyle={{ transform: 'scale(0.85)', transformOrigin: 'left center' }} />
        <span style={{ opacity: 0.3, color: '#fff' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i className="bx bx-play-circle" style={{ color: 'var(--accent-color)', fontSize: '13px' }}></i>
          <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Runner Engine</span>
        </div>
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
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(0, 230, 118, 0.25)',
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
            height: '24px',
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
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ■ Stop
        </button>

        <span style={{ opacity: 0.3, color: '#fff', margin: '0 2px' }}>|</span>

        {/* Live Server Toggle Button */}
        <button 
          onClick={toggleLiveServer}
          title={isLiveServerRunning ? `Live Server running on http://localhost:${liveServerPort}. Click to stop.` : "Start Live Server for root index.html"}
          style={{
            background: isLiveServerRunning ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255,255,255,0.06)',
            border: isLiveServerRunning ? '1px solid #00ffaa' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px',
            color: isLiveServerRunning ? '#00ffaa' : 'var(--text-main)',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '3px 9px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease',
            boxShadow: isLiveServerRunning ? '0 0 10px rgba(0, 255, 170, 0.3)' : 'none'
          }}
        >
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: isLiveServerRunning ? '#00ffaa' : '#888',
            boxShadow: isLiveServerRunning ? '0 0 6px #00ffaa' : 'none'
          }}></span>
          <span>⚡ Live Server{isLiveServerRunning ? `: :${liveServerPort}` : ''}</span>
        </button>

        <span style={{ opacity: 0.3, color: '#fff', margin: '0 2px' }}>|</span>

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
            height: '24px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {`{ }`} Format
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
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          📦 Package
        </button>

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
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          || Split
        </button>
      </div>

      {/* Right: Language Selector Dropdown on the Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div ref={langDropdownRef} className="lang-select" style={{ fontSize: '11px', gap: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span>Env:</span>
          <div className={`dropdown ${dropdownOpen ? 'open' : ''}`} style={{ position: 'relative' }}>
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)} style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              height: '24px',
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
                top: '28px',
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
