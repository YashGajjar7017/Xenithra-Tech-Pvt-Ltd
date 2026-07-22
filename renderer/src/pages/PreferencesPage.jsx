import React, { useState, useEffect } from 'react'

const PreferencesPage = () => {
  const [activeTab, setActiveTab] = useState('keybindings') // 'keybindings', 'snippets'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'vscode-dark')
  
  // Keybindings states
  const [shortcutSearch, setShortcutSearch] = useState('')
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

  // Snippets states
  const [selectedLang, setSelectedLang] = useState('javascript')
  const [snippets, setSnippets] = useState(() => {
    const saved = localStorage.getItem('user_snippets')
    return saved ? JSON.parse(saved) : {
      javascript: [
        { name: 'Console Log Debug', prefix: 'clg', desc: 'Outputs console.log debug text', body: 'console.log("Xenithra Debug:", ${1:object});' },
        { name: 'Fetch Post API', prefix: 'fetchpost', desc: 'Performs a JSON fetch POST request', body: 'fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(data)\n});' }
      ],
      php: [
        { name: 'PDO DB Connection', prefix: 'pdodb', desc: 'Initialize PDO database instance', body: '$db = new PDO("mysql:host=localhost;dbname=xenithra_db", "root", "");\n$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);' }
      ]
    }
  })
  
  const [newSnipName, setNewSnipName] = useState('')
  const [newSnipPrefix, setNewSnipPrefix] = useState('')
  const [newSnipDesc, setNewSnipDesc] = useState('')
  const [newSnipBody, setNewSnipBody] = useState('')

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

  const handleAddSnippet = (e) => {
    e.preventDefault()
    if (!newSnipName || !newSnipPrefix || !newSnipBody) return
    const newSnip = {
      name: newSnipName,
      prefix: newSnipPrefix,
      desc: newSnipDesc,
      body: newSnipBody
    }
    
    const updated = {
      ...snippets,
      [selectedLang]: [...(snippets[selectedLang] || []), newSnip]
    }
    
    setSnippets(updated)
    localStorage.setItem('user_snippets', JSON.stringify(updated))
    
    setNewSnipName('')
    setNewSnipPrefix('')
    setNewSnipDesc('')
    setNewSnipBody('')
  }

  const handleDeleteSnippet = (index) => {
    const updatedLangList = snippets[selectedLang].filter((_, idx) => idx !== index)
    const updated = {
      ...snippets,
      [selectedLang]: updatedLangList
    }
    setSnippets(updated)
    localStorage.setItem('user_snippets', JSON.stringify(updated))
  }

  const filteredShortcuts = shortcuts.filter(s => 
    s.command.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
    s.keybinding.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
    s.when.toLowerCase().includes(shortcutSearch.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: '#c9d1d9', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 30px',
        borderBottom: '1px solid var(--panel-border)',
        background: 'rgba(10, 16, 32, 0.6)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="bx bx-cog" style={{ fontSize: '24px', color: 'var(--accent-color)' }}></i>
          <h1 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase' }}>
            IDE Configuration & Preferences
          </h1>
        </div>
        <button 
          onClick={() => window.location.hash = '#/'}
          style={{
            background: 'var(--accent-color)',
            border: 'none',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '6px',
            padding: '8px 18px',
            fontSize: '11px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 255, 170, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Return to Workspace
        </button>
      </header>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--panel-border)', height: '40px', alignItems: 'center', padding: '0 30px' }}>
        <div 
          onClick={() => setActiveTab('keybindings')}
          style={{
            padding: '0 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: activeTab === 'keybindings' ? 'var(--accent-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'keybindings' ? '2px solid var(--accent-color)' : 'none',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ⌨️ KEYBOARD SHORTCUTS
        </div>
        <div 
          onClick={() => setActiveTab('snippets')}
          style={{
            padding: '0 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: activeTab === 'snippets' ? 'var(--accent-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'snippets' ? '2px solid var(--accent-color)' : 'none',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ⚡ USER CODE SNIPPETS
        </div>
      </div>

      {/* Tab Panels */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
        
        {activeTab === 'keybindings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* Search and count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Search command keybindings..." 
                value={shortcutSearch}
                onChange={e => setShortcutSearch(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {filteredShortcuts.length} total shortcuts available
              </span>
            </div>

            {/* List Table */}
            <div style={{
              background: 'rgba(22, 27, 34, 0.4)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)', height: '40px', background: 'rgba(0,0,0,0.15)' }}>
                    <th style={{ padding: '0 20px', fontWeight: 'bold', width: '35%' }}>Command</th>
                    <th style={{ padding: '0 20px', fontWeight: 'bold', width: '25%' }}>Keybinding</th>
                    <th style={{ padding: '0 20px', fontWeight: 'bold', width: '28%' }}>When Context</th>
                    <th style={{ padding: '0 20px', fontWeight: 'bold', width: '12%' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShortcuts.map((s, idx) => (
                    <tr 
                      key={idx} 
                      onDoubleClick={() => handleStartRebind(s)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: '36px', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0 20px', color: '#fff', fontWeight: '500' }}>{s.command}</td>
                      <td style={{ padding: '0 20px' }}>
                        <span 
                          onClick={() => handleStartRebind(s)}
                          style={{ 
                            background: 'rgba(0,255,170,0.08)', 
                            border: '1px solid rgba(0,255,170,0.2)', 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontFamily: 'monospace',
                            color: 'var(--accent-color)',
                            fontSize: '11px'
                          }}
                        >
                          {s.keybinding}
                        </span>
                      </td>
                      <td style={{ padding: '0 20px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px' }}>{s.when}</td>
                      <td style={{ padding: '0 20px', color: s.source === 'User' ? '#58a6ff' : 'var(--text-muted)' }}>{s.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rebinding overlay popup */}
            {editingCommand && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifycontent: 'center', zIndex: 99999 }}>
                <div style={{ background: '#161b22', border: '1px solid var(--panel-border)', borderRadius: '10px', padding: '24px', width: '420px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-color)' }}>Customize Keybinding</div>
                  <div style={{ fontSize: '12px', color: '#c9d1d9' }}>Assign hotkey for: <b>{editingCommand.command}</b></div>
                  
                  <div 
                    tabIndex={0}
                    onKeyDown={handleKeyDownCapture}
                    style={{
                      background: '#0d1117',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      padding: '16px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      color: 'var(--accent-color)',
                      outline: 'none',
                      boxShadow: '0 0 10px rgba(0,255,170,0.1)'
                    }}
                  >
                    {keyComboInput || 'Press target keys on your keyboard...'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>Capturing inputs live... Click Save to apply.</div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => setEditingCommand(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#ccc', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                    <button onClick={handleSaveRebind} style={{ background: 'var(--accent-color)', border: 'none', color: '#000', fontWeight: 'bold', padding: '6px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Save Keybinding</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'snippets' && (
          <div style={{ display: 'flex', gap: '30px' }}>
            
            {/* Left: Snippets Creation & Language selection */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>
                Add Custom Code Snippet
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Language</label>
                <select 
                  value={selectedLang} 
                  onChange={e => setSelectedLang(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                >
                  <option value="javascript">JavaScript / Node.js</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (G++)</option>
                  <option value="html">HTML / XML</option>
                  <option value="php">PHP Scripting</option>
                </select>
              </div>

              <form onSubmit={handleAddSnippet} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Snippet Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Database Connect String" 
                    value={newSnipName}
                    onChange={e => setNewSnipName(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Trigger Prefix</label>
                  <input 
                    type="text" 
                    placeholder="e.g. dbconn (types this to trigger)" 
                    value={newSnipPrefix}
                    onChange={e => setNewSnipPrefix(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Description</label>
                  <input 
                    type="text" 
                    placeholder="Brief description of the snippet template..." 
                    value={newSnipDesc}
                    onChange={e => setNewSnipDesc(e.target.value)}
                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Code Body Template</label>
                  <textarea 
                    placeholder="Enter code body template here..." 
                    value={newSnipBody}
                    onChange={e => setNewSnipBody(e.target.value)}
                    style={{ width: '100%', height: '140px', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '6px', color: 'var(--accent-color)', fontFamily: 'monospace', resize: 'none', outline: 'none' }}
                  />
                </div>
                <button 
                  type="submit"
                  style={{
                    background: 'var(--accent-color)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 'bold',
                    padding: '10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Save Code Snippet Template
                </button>
              </form>
            </div>

            {/* Right: Snippets Listing */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>
                Stored Snippets for <span style={{ color: 'var(--accent-color)', textTransform: 'capitalize' }}>{selectedLang}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
                {(snippets[selectedLang] || []).map((snip, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{snip.name}</span>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Trigger prefix: <code style={{ color: 'var(--accent-color)' }}>{snip.prefix}</code></div>
                      </div>
                      <button 
                        onClick={() => handleDeleteSnippet(idx)}
                        style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{snip.desc}</div>
                    <pre style={{ margin: 0, padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', fontFamily: 'monospace', overflowX: 'auto', color: '#888' }}>
                      {snip.body}
                    </pre>
                  </div>
                ))}
                {(snippets[selectedLang] || []).length === 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                    No snippets defined for {selectedLang} yet. Create one!
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default PreferencesPage
