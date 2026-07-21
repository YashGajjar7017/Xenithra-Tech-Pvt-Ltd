import React, { useState, useEffect } from 'react'

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCommand, setEditingCommand] = useState(null)
  const [keyComboInput, setKeyComboInput] = useState('')

  const initialShortcuts = [
    { command: 'Accept Inline Completion', keybinding: 'Ctrl + /', when: 'accessibleViewIsShown && inlineCompletion', source: 'System' },
    { command: 'Accept Inline Suggestion', keybinding: 'Tab', when: 'inlineEditIsVisible && tabShouldAcceptInlineEdit', source: 'System' },
    { command: 'Accept Inline Suggestion Alternative Action', keybinding: 'Shift + Tab', when: 'inlineEditsIsVisible', source: 'System' },
    { command: 'Add Cursor Above', keybinding: 'Ctrl + Alt + UpArrow', when: 'editorTextFocus', source: 'System' },
    { command: 'Add Cursor Below', keybinding: 'Ctrl + Alt + DownArrow', when: 'editorTextFocus', source: 'System' },
    { command: 'Add Line Comment', keybinding: 'Ctrl + K  Ctrl + C', when: 'editorTextFocus && !editorReadonly', source: 'System' },
    { command: 'Add Selection to Next Find Match', keybinding: 'Ctrl + D', when: 'editorFocus', source: 'System' },
    { command: 'Save Active File', keybinding: 'Ctrl + S', when: 'editorFocus', source: 'User' },
    { command: 'Save All Files', keybinding: 'Ctrl + Shift + S', when: 'editorFocus', source: 'User' },
    { command: 'Open File', keybinding: 'Ctrl + O', when: 'always', source: 'User' },
    { command: 'Run Code Script', keybinding: 'Ctrl + Shift + R', when: 'editorFocus', source: 'User' },
    { command: 'Debug Execution', keybinding: 'Ctrl + Shift + D', when: 'editorFocus', source: 'User' },
    { command: 'Toggle Integrated Terminal', keybinding: 'Ctrl + `', when: 'always', source: 'System' },
    { command: 'Find in Files', keybinding: 'Ctrl + Shift + F', when: 'always', source: 'System' },
    { command: 'Command Palette', keybinding: 'Ctrl + Shift + P', when: 'always', source: 'System' }
  ]

  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('user_keybindings')
    return saved ? JSON.parse(saved) : initialShortcuts
  })

  if (!isOpen) return null

  const filteredShortcuts = shortcuts.filter(s => 
    s.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.keybinding.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.when.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartRebind = (s) => {
    setEditingCommand(s)
    setKeyComboInput(s.keybinding)
  }

  const handleKeyDownCapture = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const keys = []
    if (e.ctrlKey) keys.push('Ctrl')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    if (e.metaKey) keys.push('Meta')

    const mainKey = e.key.length === 1 ? e.key.toUpperCase() : e.key
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      keys.push(mainKey)
    }

    if (keys.length > 0) {
      setKeyComboInput(keys.join(' + '))
    }
  }

  const handleSaveRebind = () => {
    if (!editingCommand || !keyComboInput) return
    const updated = shortcuts.map(s => s.command === editingCommand.command ? { ...s, keybinding: keyComboInput, source: 'User' } : s)
    setShortcuts(updated)
    localStorage.setItem('user_keybindings', JSON.stringify(updated))
    setEditingCommand(null)
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '850px',
          height: '560px',
          background: '#0d1117',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#c9d1d9',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '0.04em' }}>KEYBOARD SHORTCUTS</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Search Input Bar */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <input 
            type="text" 
            placeholder="Type to search in keybindings (Type 'quote' for history)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #58a6ff',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#8b949e', height: '32px' }}>
                <th style={{ fontWeight: 'bold', width: '35%' }}>Command</th>
                <th style={{ fontWeight: 'bold', width: '25%' }}>Keybinding</th>
                <th style={{ fontWeight: 'bold', width: '28%' }}>When</th>
                <th style={{ fontWeight: 'bold', width: '12%' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredShortcuts.map((s, idx) => (
                <tr 
                  key={idx} 
                  onDoubleClick={() => handleStartRebind(s)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', height: '30px', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ color: '#fff', fontWeight: '500' }}>{s.command}</td>
                  <td>
                    <span 
                      onClick={() => handleStartRebind(s)}
                      style={{ 
                        background: 'rgba(255,255,255,0.08)', 
                        border: '1px solid rgba(255,255,255,0.15)', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontFamily: 'monospace',
                        color: '#00ffaa' 
                      }}
                    >
                      {s.keybinding}
                    </span>
                  </td>
                  <td style={{ color: '#8b949e', fontFamily: 'monospace', fontSize: '10px' }}>{s.when}</td>
                  <td style={{ color: s.source === 'User' ? '#58a6ff' : '#8b949e' }}>{s.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rebind Shortcut Modal Overlay */}
        {editingCommand && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#161b22', border: '1px solid #58a6ff', borderRadius: '8px', padding: '20px', width: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#58a6ff' }}>Rebind Keybinding</div>
              <div style={{ fontSize: '11px', color: '#c9d1d9' }}>Command: <b>{editingCommand.command}</b></div>
              
              <div 
                tabIndex={0}
                onKeyDown={handleKeyDownCapture}
                style={{
                  background: '#0d1117',
                  border: '1px solid #00ffaa',
                  borderRadius: '6px',
                  padding: '12px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#00ffaa',
                  outline: 'none'
                }}
              >
                {keyComboInput || 'Press desired key combination...'}
              </div>
              <div style={{ fontSize: '10px', color: '#8b949e', textAlign: 'center' }}>Press keys on keyboard, then click Save</div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button onClick={() => setEditingCommand(null)} style={{ background: 'transparent', border: '1px solid #666', color: '#ccc', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveRebind} style={{ background: '#00ffaa', border: 'none', color: '#000', fontWeight: 'bold', padding: '4px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save Keybinding</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal
