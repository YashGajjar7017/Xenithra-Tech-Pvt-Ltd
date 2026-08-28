import React, { useState } from 'react'

const DebugPanel = ({
  breakpoints = [],
  activeFile = '',
  lang = 'Node.js',
  onJumpToLine,
  onStartDebug,
  onStepOver,
  onStepInto,
  onStopDebug
}) => {
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
    {
      name: 'main',
      file: activeFile.split(/[\\/]/).pop() || 'index.js',
      line: breakpoints[0] || 1,
      address: '0x7ffc82a1'
    },
    {
      name: 'Module._compile',
      file: 'node:internal/modules/cjs/loader',
      line: 1159,
      address: '0x7ffc8110'
    },
    {
      name: 'Module._extensions..js',
      file: 'node:internal/modules/cjs/loader',
      line: 1218,
      address: '0x7ffc8004'
    }
  ])

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAddWatch = () => {
    if (!newWatchInput.trim()) return
    setWatchList((prev) => [...prev, { expression: newWatchInput.trim(), value: 'undefined' }])
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

  const [focusedSection, setFocusedSection] = useState('variables')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#040712',
        color: '#c9d1d9',
        fontSize: '11px',
        borderLeft: '1px solid var(--panel-border)',
        overflowY: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Top Header Row matching VS Code exactly */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
        {/* Play Button */}
        <button
          onClick={handleStartDebugSession}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#3fb950',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s'
          }}
          title="Start Debugging (F5)"
        >
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>▷</span>
        </button>

        {/* Configuration Dropdown Selector */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div
            onClick={() => setShowConfigDropdown(!showConfigDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '3px',
              padding: '3px 6px',
              cursor: 'pointer',
              color: '#c9d1d9',
              fontSize: '11px',
              fontFamily: 'inherit'
            }}
          >
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {selectedConfig}...
            </span>
            <span style={{ fontSize: '7px', color: '#8b949e', marginLeft: '4px' }}>▼</span>
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
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 999,
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
                    color: cfg === selectedConfig ? '#58a6ff' : '#c9d1d9',
                    background: cfg === selectedConfig ? 'rgba(88, 166, 255, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      cfg === selectedConfig ? 'rgba(88, 166, 255, 0.1)' : 'transparent')
                  }
                >
                  {cfg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gear Icon */}
        <button
          onClick={() => {}}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Open Settings"
        >
          ⚙
        </button>

        {/* Three Dots Icon */}
        <button
          onClick={() => {}}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="More Actions..."
        >
          ...
        </button>
      </div>

      {/* Accordion 1: VARIABLES */}
      <div 
        onClick={() => setFocusedSection('variables')}
        style={{ 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          border: focusedSection === 'variables' ? '1px solid #007fd4' : '1px solid transparent',
          margin: '2px 0',
          transition: 'border-color 0.2s'
        }}
      >
        <div
          onClick={() => toggleSection('variables')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#8b949e',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px' }}>{openSections.variables ? '▼' : '▶'}</span>
            <span style={{ color: '#fff', textTransform: 'capitalize' }}>Variables</span>
          </div>
          <i
            className="bx bx-copy"
            style={{ color: '#8b949e', cursor: 'pointer', fontSize: '12px' }}
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(JSON.stringify(variables, null, 2))
            }}
            title="Copy Variables"
          />
        </div>
        {openSections.variables && (
          <div
            style={{
              padding: '6px 12px 10px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: '#040712'
            }}
          >
            <div style={{ fontWeight: '600', color: '#58a6ff', fontSize: '10px' }}>Local</div>
            {variables.Local.map((v, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  paddingLeft: '8px'
                }}
              >
                <span style={{ color: '#9cdcfe' }}>{v.name}:</span>
                <span
                  style={{
                    color: '#ce9178',
                    maxWidth: '140px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {v.value}
                </span>
              </div>
            ))}
            <div
              style={{ fontWeight: '600', color: '#58a6ff', fontSize: '10px', marginTop: '6px' }}
            >
              Global
            </div>
            {variables.Global.map((v, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  paddingLeft: '8px'
                }}
              >
                <span style={{ color: '#9cdcfe' }}>{v.name}:</span>
                <span style={{ color: '#8b949e' }}>{v.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 2: WATCH */}
      <div 
        onClick={() => setFocusedSection('watch')}
        style={{ 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          border: focusedSection === 'watch' ? '1px solid #007fd4' : '1px solid transparent',
          margin: '2px 0',
          transition: 'border-color 0.2s'
        }}
      >
        <div
          onClick={() => toggleSection('watch')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#8b949e',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px' }}>{openSections.watch ? '▼' : '▶'}</span>
            <span style={{ color: '#fff', textTransform: 'capitalize' }}>Watch</span>
          </div>
          <span
            onClick={(e) => {
              e.stopPropagation()
              handleAddWatch()
            }}
            style={{ color: '#58a6ff', fontSize: '14px', cursor: 'pointer' }}
          >
            +
          </span>
        </div>
        {openSections.watch && (
          <div
            style={{
              padding: '6px 12px 10px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: '#040712'
            }}
          >
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input
                type="text"
                placeholder="Expression to watch..."
                value={newWatchInput}
                onChange={(e) => setNewWatchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWatch()}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  outline: 'none'
                }}
              />
            </div>
            {watchList.map((w, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', justify: 'space-between', fontSize: '11px' }}
              >
                <span style={{ color: '#d8b4fe' }}>{w.expression}</span>
                <span style={{ color: '#00ffaa' }}>{w.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 3: CALL STACK */}
      <div 
        onClick={() => setFocusedSection('callStack')}
        style={{ 
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          border: focusedSection === 'callStack' ? '1px solid #007fd4' : '1px solid transparent',
          margin: '2px 0',
          transition: 'border-color 0.2s'
        }}
      >
        <div
          onClick={() => toggleSection('callStack')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#8b949e',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <span style={{ fontSize: '9px' }}>{openSections.callStack ? '▼' : '▶'}</span>
          <span style={{ color: '#fff', textTransform: 'capitalize' }}>Call Stack</span>
        </div>
        {openSections.callStack && (
          <div
            style={{
              padding: '6px 12px 10px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: '#040712'
            }}
          >
            {callStack.map((cs, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: idx === 0 ? '#00ffaa' : '#c9d1d9'
                }}
              >
                <span>{cs.name}</span>
                <span style={{ color: '#8b949e', fontSize: '10px' }}>
                  {cs.file}:{cs.line}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion 4: BREAKPOINTS */}
      <div
        onClick={() => setFocusedSection('breakpoints')}
        style={{ 
          border: focusedSection === 'breakpoints' ? '1px solid #007fd4' : '1px solid transparent',
          margin: '2px 0',
          transition: 'border-color 0.2s'
        }}
      >
        <div
          onClick={() => toggleSection('breakpoints')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#8b949e',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <span style={{ fontSize: '9px' }}>{openSections.breakpoints ? '▼' : '▶'}</span>
          <span style={{ color: '#fff', textTransform: 'capitalize' }}>Breakpoints</span>
        </div>
        {openSections.breakpoints && (
          <div
            style={{
              padding: '6px 12px 10px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: '#040712'
            }}
          >
            {breakpoints.length === 0 ? (
              <div style={{ fontSize: '10px', color: '#8b949e', fontStyle: 'italic' }}>
                No line breakpoints active.
              </div>
            ) : (
              breakpoints.map((bpLine, idx) => (
                <div
                  key={idx}
                  onClick={() => onJumpToLine && onJumpToLine(bpLine)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input type="checkbox" defaultChecked style={{ width: '12px', height: '12px' }} />
                  <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>
                    ● {activeFile.split(/[\\/]/).pop() || 'index.js'}
                  </span>
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
