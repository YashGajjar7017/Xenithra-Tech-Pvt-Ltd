import React, { useState } from 'react'

const DebugPanel = ({ breakpoints = [], activeFile = '', lang = 'Node.js', onJumpToLine }) => {
  const [compilerFlags, setCompilerFlags] = useState({
    debugSymbols: true,
    warningsAll: true,
    optimization: false,
    cpp17: true
  })
  const [watchedVars, setWatchedVars] = useState([
    { name: 'argc', value: '1' },
    { name: 'argv[0]', value: '"/bin/app"' },
    { name: 'status', value: '0 (SUCCESS)' }
  ])
  const [newVarInput, setNewVarInput] = useState('')
  const [debugLog, setDebugLog] = useState([
    { level: 'info', text: 'Debugger engine loaded. Breakpoints active.' }
  ])

  const toggleFlag = (key) => {
    setCompilerFlags(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const addWatchVar = () => {
    if (!newVarInput.trim()) return
    setWatchedVars(prev => [...prev, { name: newVarInput.trim(), value: 'undefined (not in scope)' }])
    setNewVarInput('')
  }

  const getActiveFlagsString = () => {
    const flags = []
    if (compilerFlags.debugSymbols) flags.push('-g')
    if (compilerFlags.warningsAll) flags.push('-Wall')
    if (compilerFlags.optimization) flags.push('-O2')
    if (compilerFlags.cpp17) flags.push('-std=c++17')
    return flags.join(' ')
  }

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
        padding: '12px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <span style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '0.08em', color: '#00ffaa' }}>🐞 RUN & DEBUG SUITE</span>
        <span style={{ fontSize: '10px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', padding: '2px 6px', borderRadius: '4px' }}>
          {lang}
        </span>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        <button 
          title="Continue (F5)"
          style={{ flex: 1, background: '#00e676', border: 'none', color: '#000', borderRadius: '4px', padding: '6px 0', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
          onClick={() => setDebugLog(prev => [...prev, { level: 'info', text: '▶ Continued execution...' }])}
        >
          ▶ Continue
        </button>
        <button 
          title="Step Over (F10)"
          style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', padding: '6px 0', cursor: 'pointer', fontSize: '11px' }}
          onClick={() => setDebugLog(prev => [...prev, { level: 'info', text: '↷ Step Over next statement' }])}
        >
          ↷ Step Over
        </button>
        <button 
          title="Step Into (F11)"
          style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', padding: '6px 0', cursor: 'pointer', fontSize: '11px' }}
          onClick={() => setDebugLog(prev => [...prev, { level: 'info', text: '↳ Step Into function' }])}
        >
          ↳ Step Into
        </button>
      </div>

      {/* Compiler Flags Config Section */}
      <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8b949e', marginBottom: '8px', letterSpacing: '0.05em' }}>COMPILER FLAGS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={compilerFlags.debugSymbols} onChange={() => toggleFlag('debugSymbols')} />
            <span>Generate Debug Symbols (<code>-g</code>)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={compilerFlags.warningsAll} onChange={() => toggleFlag('warningsAll')} />
            <span>Enable All Warnings (<code>-Wall</code>)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={compilerFlags.optimization} onChange={() => toggleFlag('optimization')} />
            <span>Optimize Release Binary (<code>-O2</code>)</span>
          </label>
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#58a6ff' }}>
          Flags: <code>{getActiveFlagsString()}</code>
        </div>
      </div>

      {/* Breakpoints Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8b949e', marginBottom: '6px', letterSpacing: '0.05em' }}>BREAKPOINTS</div>
        {breakpoints.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#8b949e', fontStyle: 'italic' }}>No line breakpoints set. Click line numbers in editor to toggle.</div>
        ) : (
          breakpoints.map((bpLine, idx) => (
            <div 
              key={idx} 
              onClick={() => onJumpToLine && onJumpToLine(bpLine)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' }}
            >
              <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>● Line {bpLine}</span>
              <span style={{ fontSize: '10px', color: '#8b949e' }}>in {activeFile.split(/[\\/]/).pop() || 'file'}</span>
            </div>
          ))
        )}
      </div>

      {/* Watch Variables Section */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8b949e', marginBottom: '6px', letterSpacing: '0.05em' }}>WATCH VARIABLES</div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <input 
            type="text" 
            placeholder="Add variable name..." 
            value={newVarInput} 
            onChange={(e) => setNewVarInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWatchVar()}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}
          />
          <button onClick={addWatchVar} style={{ background: '#58a6ff', border: 'none', color: '#fff', borderRadius: '4px', padding: '0 10px', cursor: 'pointer', fontSize: '11px' }}>+</button>
        </div>
        {watchedVars.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#d8b4fe', fontWeight: '500' }}>{item.name}</span>
            <span style={{ color: '#00ffaa' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Debug Console Logs */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#8b949e', marginBottom: '6px', letterSpacing: '0.05em' }}>DEBUG LOGS</div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', height: '100px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px' }}>
          {debugLog.map((log, idx) => (
            <div key={idx} style={{ color: log.level === 'error' ? '#ff6b6b' : '#8b949e', marginBottom: '2px' }}>
              {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DebugPanel
