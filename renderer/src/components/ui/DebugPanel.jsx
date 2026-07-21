import React, { useState } from 'react'

const DebugPanel = ({ breakpoints = [], activeFile = '', lang = 'Node.js', onJumpToLine, onStartDebug, onStepOver, onStepInto, onStopDebug }) => {
  const [selectedConfig, setSelectedConfig] = useState('Debug All')
  const [showConfigDropdown, setShowConfigDropdown] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const [activePausedLine, setActivePausedLine] = useState(null)

  // Accordion collapsed state
  const [openSections, setOpenSections] = useState({
    variables: true,
    watch: true,
    callStack: true,
    breakpoints: true
  })

  const [variables, setVariables] = useState({
    Local: [
      { name: 'exports', value: '{}' },
      { name: 'require', value: 'function require(path)' },
      { name: 'module', value: '{ id: ".", exports: {} }' },
      { name: '__filename', value: `"${activeFile || 'index.js'}"` },
      { name: '__dirname', value: '"/workspace/src"' },
      { name: 'status', value: '200 (OK)' }
    ],
    Global: [
      { name: 'global', value: 'Object [global]' },
      { name: 'process', value: 'process { title: "node" }' },
      { name: 'console', value: 'Object [console]' }
    ]
  })

  const [watchList, setWatchList] = useState([
    { expression: 'process.env.NODE_ENV', value: '"development"' },
    { expression: 'activeFile', value: `"${activeFile.split(/[\\/]/).pop() || 'index.js'}"` }
  ])
  const [newWatchInput, setNewWatchInput] = useState('')

  const [callStack, setCallStack] = useState([
    { name: 'main', file: activeFile.split(/[\\/]/).pop() || 'index.js', line: breakpoints[0] || 1, address: '0x7ffc82a1' },
    { name: 'Module._compile', file: 'node:internal/modules/cjs/loader', line: 1159, address: '0x7ffc8110' },
    { name: 'Module._extensions..js', file: 'node:internal/modules/cjs/loader', line: 1218, address: '0x7ffc8004' }
  ])

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAddWatch = () => {
    if (!newWatchInput.trim()) return
    setWatchList(prev => [...prev, { expression: newWatchInput.trim(), value: 'undefined' }])
    setNewWatchInput('')
  }

  const handleStartDebugSession = () => {
    setIsDebugging(true)
    const targetLine = breakpoints[0] || 1
    setActivePausedLine(targetLine)
    if (onJumpToLine) onJumpToLine(targetLine)
    if (onStartDebug) onStartDebug(targetLine)
  }

  const handleStepOverAction = () => {
    if (!isDebugging) return
    const nextLine = (activePausedLine || 1) + 1
    setActivePausedLine(nextLine)
    if (onJumpToLine) onJumpToLine(nextLine)
    if (onStepOver) onStepOver(nextLine)
  }

  const handleStopDebugSession = () => {
    setIsDebugging(false)
    setActivePausedLine(null)
    if (onStopDebug) onStopDebug()
  }

  const configs = [
    'Debug All',
    'Debug Main Process',
    'Node.js...',
    'Python Debugger...',
    'Add Configuration...'
  ]

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0d1117',
        color: '#c9d1d9',
        fontSize: '12px',
        borderLeft: '1px solid var(--panel-border)',
        overflowY: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Top Header & Launch Config Selector Dropdown */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '0.05em', color: '#c9d1d9' }}>
            RUN AND DEBUG
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowConfigDropdown(!showConfigDropdown)}
              style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '14px' }}
              title="Configure Settings"
            >
              ⚙
            </button>
            <button 
              style={{ background: 'transparent', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '14px' }}
              title="More Actions"
            >
              ...
            </button>
          </div>
        </div>

        {/* Debug Launcher Select Button */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowConfigDropdown(!showConfigDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '4px',
              padding: '5px 8px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#00e676', fontWeight: 'bold', fontSize: '14px' }}>▷</span>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>{selectedConfig}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#8b949e' }}>▼</span>
          </div>

          {/* Configuration Dropdown Items */}
          {showConfigDropdown && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#161b22',
                border: '1px solid var(--panel-border)',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 99,
                overflow: 'hidden'
              }}
            >
              {configs.map((cfg, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSelectedConfig(cfg)
                    setShowConfigDropdown(false)
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: cfg === selectedConfig ? '#00ffaa' : '#c9d1d9',
                    background: cfg === selectedConfig ? 'rgba(0, 255, 170, 0.1)' : 'transparent',
                    borderTop: idx === 2 ? '1px solid rgba(255,255,255,0.08)' : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = cfg === selectedConfig ? 'rgba(0, 255, 170, 0.1)' : 'transparent'}
                >
                  {cfg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Execution Toolbar Controls */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          {!isDebugging ? (
            <button 
              onClick={handleStartDebugSession}
              style={{ flex: 1, background: '#00e676', border: 'none', color: '#000', borderRadius: '4px', padding: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
            >
              ▶ Start Debugging (F5)
            </button>
          ) : (
            <React.Fragment>
              <button onClick={handleStepOverAction} title="Step Over (F10)" style={{ flex: 1, background: '#58a6ff', border: 'none', color: '#fff', borderRadius: '3px', padding: '4px', cursor: 'pointer', fontSize: '10px' }}>↷ Step</button>
              <button onClick={handleStartDebugSession} title="Restart (Ctrl+Shift+F5)" style={{ background: '#d8b4fe', border: 'none', color: '#000', borderRadius: '3px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px' }}>↻</button>
              <button onClick={handleStopDebugSession} title="Stop (Shift+F5)" style={{ background: '#ff4d4d', border: 'none', color: '#fff', borderRadius: '3px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px' }}>■</button>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Accordion 1: VARIABLES */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div 
          onClick={() => toggleSection('variables')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', color: '#8b949e', background: 'rgba(255,255,255,0.02)' }}
        >
          <span>{openSections.variables ? '▾' : '▸'}</span>
          <span>Variables</span>
        </div>
        {openSections.variables && (
          <div style={{ padding: '4px 12px 8px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: '600', color: '#58a6ff', fontSize: '10px' }}>Local</div>
            {variables.Local.map((v, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingLeft: '8px' }}>
                <span style={{ color: '#9cdcfe' }}>{v.name}:</span>
                <span style={{ color: '#ce9178', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.value}</span>
              </div>
            ))}
            <div style={{ fontWeight: '600', color: '#58a6ff', fontSize: '10px', marginTop: '4px' }}>Global</div>
            {variables.Global.map((v, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingLeft: '8px' }}>
                <span style={{ color: '#9cdcfe' }}>{v.name}:</span>
                <span style={{ color: '#8b949e' }}>{v.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 2: WATCH */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div 
          onClick={() => toggleSection('watch')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', color: '#8b949e', background: 'rgba(255,255,255,0.02)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{openSections.watch ? '▾' : '▸'}</span>
            <span>Watch</span>
          </div>
          <span onClick={(e) => { e.stopPropagation(); handleAddWatch() }} style={{ color: '#58a6ff', fontSize: '14px', cursor: 'pointer' }}>+</span>
        </div>
        {openSections.watch && (
          <div style={{ padding: '4px 12px 8px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input 
                type="text" 
                placeholder="Expression to watch..." 
                value={newWatchInput} 
                onChange={(e) => setNewWatchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWatch()}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '3px 6px', borderRadius: '3px', fontSize: '10px' }}
              />
            </div>
            {watchList.map((w, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: '#d8b4fe' }}>{w.expression}</span>
                <span style={{ color: '#00ffaa' }}>{w.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 3: CALL STACK */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div 
          onClick={() => toggleSection('callStack')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', color: '#8b949e', background: 'rgba(255,255,255,0.02)' }}
        >
          <span>{openSections.callStack ? '▾' : '▸'}</span>
          <span>Call Stack</span>
        </div>
        {openSections.callStack && (
          <div style={{ padding: '4px 12px 8px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {callStack.map((cs, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: idx === 0 ? '#00ffaa' : '#c9d1d9' }}>
                <span>{cs.name}</span>
                <span style={{ color: '#8b949e', fontSize: '10px' }}>{cs.file}:{cs.line}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 4: BREAKPOINTS */}
      <div>
        <div 
          onClick={() => toggleSection('breakpoints')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', color: '#8b949e', background: 'rgba(255,255,255,0.02)' }}
        >
          <span>{openSections.breakpoints ? '▾' : '▸'}</span>
          <span>Breakpoints</span>
        </div>
        {openSections.breakpoints && (
          <div style={{ padding: '4px 12px 8px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {breakpoints.length === 0 ? (
              <div style={{ fontSize: '10px', color: '#8b949e', fontStyle: 'italic' }}>No line breakpoints active.</div>
            ) : (
              breakpoints.map((bpLine, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onJumpToLine && onJumpToLine(bpLine)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input type="checkbox" defaultChecked style={{ width: '12px', height: '12px' }} />
                  <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>● {activeFile.split(/[\\/]/).pop() || 'index.js'}</span>
                  <span style={{ fontSize: '10px', color: '#58a6ff' }}>{bpLine}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugPanel
