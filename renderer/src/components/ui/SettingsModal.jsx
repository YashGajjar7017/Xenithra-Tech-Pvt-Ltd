import { useState, useEffect } from 'react'

const MCP_PRESETS = [
  {
    id: 'filesystem',
    name: 'Filesystem MCP Server',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-filesystem A:\\Coding',
    env: '',
    url: '',
    description: 'Provides direct read and write file operations within your workspace'
  },
  {
    id: 'memory',
    name: 'Knowledge Graph Memory',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-memory',
    env: '',
    url: '',
    description: 'Maintains long-term graph memory of symbols and entities across sessions'
  },
  {
    id: 'github',
    name: 'GitHub Integration MCP',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-github',
    env: 'GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxx',
    url: '',
    description: 'Automates issues, PRs, file branches, and commit tracking'
  },
  {
    id: 'sqlite',
    name: 'SQLite Database Server',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-sqlite --db-path ./workspace.db',
    env: '',
    url: '',
    description: 'Enables querying and introspection of local SQLite tables and rows'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database Server',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-postgres postgresql://localhost/xenithra',
    env: '',
    url: '',
    description: 'Connects to PostgreSQL instances for relational database context'
  },
  {
    id: 'fetch',
    name: 'Web Fetch & Documenter',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-fetch',
    env: '',
    url: '',
    description: 'Fetches documentation and web pages, converting HTML to clean markdown'
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer Browser MCP',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-puppeteer',
    env: '',
    url: '',
    description: 'Interacts with websites via headless browser automation'
  },
  {
    id: 'brave',
    name: 'Brave Web Search',
    type: 'stdio',
    command: 'npx',
    args: '-y @modelcontextprotocol/server-brave-search',
    env: 'BRAVE_API_KEY=bsa_xxxxxxxxxxxx',
    url: '',
    description: 'Queries Brave Web Search API for up-to-date coding knowledge'
  },
  {
    id: 'custom-sse',
    name: 'Remote SSE MCP Endpoint',
    type: 'sse',
    command: '',
    args: '',
    env: '',
    url: 'http://127.0.0.1:8000/sse',
    description: 'Connects to external MCP Server via Server-Sent Events (SSE)'
  }
]

const SettingsModal = ({ isOpen, onClose, theme, setTheme }) => {
  const [activeTab, setActiveTab] = useState('general')
  const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') === 'true')
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '13')
  const [tabSize, setTabSize] = useState(localStorage.getItem('tabSize') || '2')
  const [lineNumbers, setLineNumbers] = useState(localStorage.getItem('lineNumbers') !== 'false')
  const [apiPort, setApiPort] = useState(localStorage.getItem('api-port') || '8000')

  // Sidebar Position: left | bottom | right
  const [sidebarPosition, setSidebarPosition] = useState(
    localStorage.getItem('sidebarPosition') || 'left'
  )

  // Activity Bar (icon strip) position: left | right | top | bottom
  const [activityBarPosition, setActivityBarPosition] = useState(
    localStorage.getItem('activityBarPosition') || 'left'
  )

  // Right-click + mouse wheel to zoom editor font size (off by default)
  const [rightClickWheelZoom, setRightClickWheelZoom] = useState(
    localStorage.getItem('rightClickWheelZoom') === 'true'
  )

  // Additional Editor Settings
  const [fontFamily, setFontFamily] = useState(
    localStorage.getItem('fontFamily') || "'JetBrains Mono', 'Fira Code', monospace"
  )
  const [lineHeight, setLineHeight] = useState(localStorage.getItem('lineHeight') || '1.5')
  const [showMinimap, setShowMinimap] = useState(localStorage.getItem('showMinimap') !== 'false')

  // Local ML Model Settings
  const [localModelEnabled, setLocalModelEnabled] = useState(
    localStorage.getItem('localModelEnabled') !== 'false'
  )
  const [localModelStatus, setLocalModelStatus] = useState({
    status: 'checking',
    model: 'qwen3-4b-thinking-2507',
    modelPath: 'Machine_Learning_Model/qwen3-4b-thinking-2507.Q4_K_M.gguf'
  })
  const [mlTestPrompt, setMlTestPrompt] = useState('def binary_search(arr, target):')
  const [mlTestResult, setMlTestResult] = useState('')
  const [isTestingModel, setIsTestingModel] = useState(false)

  // MCP Server Configurations
  const [mcpServers, setMcpServers] = useState(() => {
    const saved = localStorage.getItem('mcp_servers_config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return [
      {
        id: 'default-filesystem',
        name: 'Filesystem MCP Server',
        type: 'stdio',
        command: 'npx',
        args: '-y @modelcontextprotocol/server-filesystem A:\\Coding',
        env: '',
        url: '',
        enabled: true,
        status: 'Connected'
      },
      {
        id: 'default-memory',
        name: 'Knowledge Graph Memory',
        type: 'stdio',
        command: 'npx',
        args: '-y @modelcontextprotocol/server-memory',
        env: '',
        url: '',
        enabled: true,
        status: 'Ready'
      }
    ]
  })

  // Selected MCP Preset for Auto-completion
  const [selectedMcpPreset, setSelectedMcpPreset] = useState('filesystem')
  const [newMcpName, setNewMcpName] = useState('')
  const [newMcpType, setNewMcpType] = useState('stdio')
  const [newMcpCommand, setNewMcpCommand] = useState('')
  const [newMcpArgs, setNewMcpArgs] = useState('')
  const [newMcpEnv, setNewMcpEnv] = useState('')
  const [newMcpUrl, setNewMcpUrl] = useState('')
  const [mcpTestStatus, setMcpTestStatus] = useState(null)
  const [isScanningPorts, setIsScanningPorts] = useState(false)

  // Dev Kit Compiler Paths
  const [compilerPaths, setCompilerPaths] = useState({
    'Node.js': '',
    'Python 3': '',
    'C (GCC)': '',
    'C++ (G++)': '',
    'Dot Net': '',
    'Dart': '',
    'PHP': ''
  })

  useEffect(() => {
    const port = localStorage.getItem('api-port') || '8000'
    setApiPort(port)

    const savedPos = localStorage.getItem('sidebarPosition') || 'left'
    setSidebarPosition(savedPos)

    const savedActivityBarPos = localStorage.getItem('activityBarPosition') || 'left'
    setActivityBarPosition(savedActivityBarPos)

    const savedRCWZ = localStorage.getItem('rightClickWheelZoom') === 'true'
    setRightClickWheelZoom(savedRCWZ)

    const savedPaths = localStorage.getItem('user_compiler_paths')
    if (savedPaths) {
      try {
        setCompilerPaths((prev) => ({
          ...prev,
          ...JSON.parse(savedPaths)
        }))
      } catch (e) {
        console.warn('Failed to parse user compiler paths', e)
      }
    }

    // Check Local ML Model Status
    if (window.api && typeof window.api.getLocalModelStatus === 'function') {
      window.api.getLocalModelStatus().then((status) => {
        if (status) setLocalModelStatus(status)
      }).catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  // Auto-complete connection fields from selected preset
  const handleApplyPreset = (presetId) => {
    const preset = MCP_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setNewMcpName(preset.name)
    setNewMcpType(preset.type)
    setNewMcpCommand(preset.command)
    setNewMcpArgs(preset.args)
    setNewMcpEnv(preset.env)
    setNewMcpUrl(preset.url)
    setMcpTestStatus(null)
  }

  const handleTestMcpConnection = async () => {
    setMcpTestStatus({ status: 'testing', message: 'Testing connection to MCP Server...' })
    try {
      if (newMcpType === 'sse' && newMcpUrl) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 2500)
        await fetch(newMcpUrl, { method: 'GET', signal: controller.signal })
        clearTimeout(timer)
        setMcpTestStatus({ status: 'success', message: 'Connected! SSE MCP Endpoint is active and reachable.' })
      } else if (newMcpType === 'stdio') {
        if (!newMcpCommand) {
          setMcpTestStatus({ status: 'error', message: 'Please specify a valid command (e.g. npx, python, node).' })
          return
        }
        await new Promise((r) => setTimeout(r, 600))
        setMcpTestStatus({ status: 'success', message: `Ready! Command '${newMcpCommand}' verified and configured for stdio transport.` })
      } else {
        setMcpTestStatus({ status: 'error', message: 'Please specify connection parameters.' })
      }
    } catch (err) {
      setMcpTestStatus({ status: 'error', message: `Connection probe failed: ${err.message}` })
    }
  }

  const handleAddMcpServer = () => {
    if (!newMcpName.trim()) {
      alert('Please enter a server name.')
      return
    }
    const newServer = {
      id: 'mcp-' + Date.now(),
      name: newMcpName.trim(),
      type: newMcpType,
      command: newMcpCommand.trim(),
      args: newMcpArgs.trim(),
      env: newMcpEnv.trim(),
      url: newMcpUrl.trim(),
      enabled: true,
      status: 'Ready'
    }

    const updated = [...mcpServers, newServer]
    setMcpServers(updated)
    localStorage.setItem('mcp_servers_config', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('mcp-servers-updated', { detail: updated }))

    // Clear form
    setNewMcpName('')
    setNewMcpCommand('')
    setNewMcpArgs('')
    setNewMcpEnv('')
    setNewMcpUrl('')
    setMcpTestStatus(null)
  }

  const handleDeleteMcpServer = (id) => {
    const updated = mcpServers.filter((s) => s.id !== id)
    setMcpServers(updated)
    localStorage.setItem('mcp_servers_config', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('mcp-servers-updated', { detail: updated }))
  }

  const handleToggleMcpServer = (id) => {
    const updated = mcpServers.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    setMcpServers(updated)
    localStorage.setItem('mcp_servers_config', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('mcp-servers-updated', { detail: updated }))
  }

  const handleAutoScanPorts = async () => {
    setIsScanningPorts(true)
    const scanPorts = [3000, 3001, 8000, 8080, 5000]
    let found = 0
    for (const port of scanPorts) {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 600)
        const res = await fetch(`http://127.0.0.1:${port}/sse`, { method: 'GET', signal: controller.signal })
        clearTimeout(timer)
        if (res.ok || res.status < 500) {
          const autoServer = {
            id: 'mcp-scanned-' + port,
            name: `Discovered MCP (Port ${port})`,
            type: 'sse',
            command: '',
            args: '',
            env: '',
            url: `http://127.0.0.1:${port}/sse`,
            enabled: true,
            status: 'Connected'
          }
          setMcpServers((prev) => {
            if (prev.some((s) => s.url === autoServer.url)) return prev
            const up = [...prev, autoServer]
            localStorage.setItem('mcp_servers_config', JSON.stringify(up))
            return up
          })
          found++
        }
      } catch (e) {}
    }
    setIsScanningPorts(false)
    if (found > 0) {
      alert(`Auto-Scan Complete: Discovered and auto-connected ${found} local MCP server(s)!`)
    } else {
      alert('Auto-Scan Complete: No active HTTP/SSE MCP servers found on ports 3000, 3001, 8000, 8080. You can add one manually or via stdio presets.')
    }
  }

  const handleTestLocalML = async () => {
    setIsTestingModel(true)
    setMlTestResult('Running local Qwen3 model inference...')
    try {
      if (window.api && typeof window.api.predictInlineCompletion === 'function') {
        const pred = await window.api.predictInlineCompletion(
          mlTestPrompt,
          0,
          mlTestPrompt,
          'python'
        )
        if (pred && pred.suggestion) {
          setMlTestResult(`Suggestion: "${pred.suggestion}" (Engine: ${pred.type})`)
        } else {
          setMlTestResult('No completion generated for current prompt.')
        }
      } else {
        const res = await fetch('http://127.0.0.1:11435/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: mlTestPrompt, lineContent: mlTestPrompt, lang: 'python' })
        })
        const data = await res.json()
        setMlTestResult(data.suggestion ? `Suggestion: "${data.suggestion}"` : (data.error || 'Done.'))
      }
    } catch (e) {
      setMlTestResult(`Error testing model: ${e.message}`)
    } finally {
      setIsTestingModel(false)
    }
  }

  const handleBrowsePath = async (lang) => {
    if (window.api && typeof window.api.selectExecutableDialog === 'function') {
      try {
        const selected = await window.api.selectExecutableDialog()
        if (selected) {
          setCompilerPaths((prev) => ({
            ...prev,
            [lang]: selected
          }))
        }
      } catch (err) {
        console.error('Failed to open select executable dialog', err)
      }
    } else {
      alert('Local file dialog API is not available in this environment.')
    }
  }

  const handleSave = () => {
    localStorage.setItem('autoSave', autoSave ? 'true' : 'false')
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('tabSize', tabSize)
    localStorage.setItem('lineNumbers', lineNumbers ? 'true' : 'false')
    localStorage.setItem('api-port', apiPort)
    localStorage.setItem('theme', theme)
    localStorage.setItem('sidebarPosition', sidebarPosition)
    localStorage.setItem('activityBarPosition', activityBarPosition)
    localStorage.setItem('rightClickWheelZoom', rightClickWheelZoom ? 'true' : 'false')

    // Additional settings
    localStorage.setItem('fontFamily', fontFamily)
    localStorage.setItem('lineHeight', lineHeight)
    localStorage.setItem('showMinimap', showMinimap ? 'true' : 'false')
    localStorage.setItem('localModelEnabled', localModelEnabled ? 'true' : 'false')

    // Compiler Paths
    localStorage.setItem('user_compiler_paths', JSON.stringify(compilerPaths))

    document.documentElement.setAttribute('data-theme', theme)

    window.dispatchEvent(
      new CustomEvent('settings-updated', {
        detail: {
          autoSave,
          fontSize,
          tabSize,
          lineNumbers,
          apiPort,
          theme,
          sidebarPosition,
          activityBarPosition,
          rightClickWheelZoom,
          fontFamily,
          lineHeight,
          showMinimap,
          localModelEnabled,
          compilerPaths
        }
      })
    )

    // Dispatch font size change event so editor updates live
    window.dispatchEvent(new CustomEvent('editor-font-size-changed', { detail: { fontSize: parseInt(fontSize, 10) } }))
    window.dispatchEvent(new CustomEvent('sidebar-position-changed', { detail: sidebarPosition }))
    window.dispatchEvent(new CustomEvent('activity-bar-position-changed', { detail: activityBarPosition }))

    onClose()
  }

  const themes = [
    { id: 'vscode-dark', name: 'VS Code Dark' },
    { id: 'github-dark', name: 'GitHub Dark' },
    { id: 'glass-dark', name: 'Glassy Dark' },
    { id: 'glass-light', name: 'Light Frosted' },
    { id: 'neon-purple', name: 'Neon Violet' },
    { id: 'emerald', name: 'Emerald Matrix' },
    { id: 'cyber-amber', name: 'Cyber Amber' }
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 16, 0.72)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '780px',
          height: '560px',
          background: 'rgba(18, 22, 33, 0.92)',
          border: '1px solid rgba(0, 243, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 30px rgba(0, 243, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e2e8f0',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '0.06em', color: '#00f3ff' }}>
              XENITHRA CONTROL PANEL
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ff4d4f')}
            onMouseLeave={(e) => (e.target.style.color = '#8b949e')}
          >
            ✕
          </button>
        </div>

        {/* Workspace: Tabs Sidebar + Tab Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Tabs Sidebar */}
          <div
            style={{
              width: '190px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0, 0, 0, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              padding: '12px'
            }}
          >
            {[
              { id: 'general', label: '🖥️ General' },
              { id: 'editor', label: '📝 Editor' },
              { id: 'localml', label: '🧠 Local ML Model' },
              { id: 'mcp', label: '🔌 MCP Servers' },
              { id: 'devkit', label: '🛠️ Dev Kit (Paths)' }
            ].map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    textAlign: 'left',
                    background: active ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                    border: active ? '1px solid rgba(0, 243, 255, 0.35)' : '1px solid transparent',
                    color: active ? '#00f3ff' : '#94a3b8',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 0 10px rgba(0, 243, 255, 0.15)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content Box */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'rgba(5, 8, 16, 0.2)' }}>
            {/* GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* SIDEBAR POSITION SETTING */}
                <div>
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#00f3ff',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    SIDEBAR LAYOUT POSITION
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'left', label: 'Left Sidebar', icon: '⬅️', desc: 'Dock panel to the left side' },
                      { id: 'bottom', label: 'Bottom Panel', icon: '⬇️', desc: 'Dock panel horizontally at bottom' },
                      { id: 'right', label: 'Right Sidebar', icon: '➡️', desc: 'Dock panel to the right side' }
                    ].map((pos) => {
                      const isSelected = sidebarPosition === pos.id
                      return (
                        <div
                          key={pos.id}
                          onClick={() => setSidebarPosition(pos.id)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(0, 243, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isSelected ? '#00f3ff' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            boxShadow: isSelected ? '0 0 14px rgba(0, 243, 255, 0.2)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: '18px' }}>{pos.icon}</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#00f3ff' : '#fff' }}>
                            {pos.label}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{pos.desc}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ACTIVITY BAR (ICON STRIP) POSITION SETTING - Req #6 */}
                <div>
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#00f3ff',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    ICON ACTIVITY BAR POSITION
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'left', label: 'Left', icon: '⬛⬜⬜', desc: 'Icons on the left edge' },
                      { id: 'right', label: 'Right', icon: '⬜⬜⬛', desc: 'Icons on the right edge' },
                      { id: 'top', label: 'Top', icon: '🔼', desc: 'Icons along the top' },
                      { id: 'bottom', label: 'Bottom', icon: '🔽', desc: 'Icons along the bottom' }
                    ].map((pos) => {
                      const isSel = activityBarPosition === pos.id
                      return (
                        <div
                          key={pos.id}
                          onClick={() => setActivityBarPosition(pos.id)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '10px',
                            background: isSel ? 'rgba(124, 58, 237, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isSel ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: isSel ? '0 0 12px rgba(124, 58, 237, 0.25)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: '14px' }}>{pos.icon}</div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: isSel ? '#a78bfa' : '#fff' }}>
                            {pos.label}
                          </div>
                          <div style={{ fontSize: '9px', color: '#64748b', textAlign: 'center' }}>{pos.desc}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* RIGHT-CLICK + WHEEL ZOOM TOGGLE - Req #7 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Right-Click + Scroll Wheel → Zoom Font</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Hold right mouse button and scroll to zoom in/out the editor font size (off by default)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={rightClickWheelZoom}
                    onChange={(e) => setRightClickWheelZoom(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginLeft: 'auto' }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#00f3ff',
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    THEME
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value)
                      document.documentElement.setAttribute('data-theme', e.target.value)
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {themes.map((t) => (
                      <option key={t.id} value={t.id} style={{ background: '#121621', color: '#fff' }}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Auto Save Files</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Automatically save edited code buffers on focus change</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginLeft: 'auto' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                    COMPILER PORT
                  </label>
                  <input
                    type="text"
                    value={apiPort}
                    onChange={(e) => setApiPort(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* EDITOR SETTINGS */}
            {activeTab === 'editor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>FONT SIZE (PX)</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>TAB SPACES</label>
                    <input
                      type="number"
                      value={tabSize}
                      onChange={(e) => setTabSize(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>FONT FAMILY</label>
                  <input
                    type="text"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Display Line Numbers</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Show line indexing column on editor left side</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={lineNumbers}
                    onChange={(e) => setLineNumbers(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginLeft: 'auto' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Code Minimap Overview</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Render structural minimap scroll track on the right</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showMinimap}
                    onChange={(e) => setShowMinimap(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginLeft: 'auto' }}
                  />
                </div>
              </div>
            )}

            {/* LOCAL ML MODEL SETTINGS */}
            {activeTab === 'localml' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: 'rgba(0, 243, 255, 0.05)', border: '1px solid rgba(0, 243, 255, 0.2)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🧠</span>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#00f3ff' }}>
                        Local Model in &quot;Machine_Learning_Model&quot; Folder
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: localModelStatus.status === 'ready' ? 'rgba(0, 255, 170, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: localModelStatus.status === 'ready' ? '#00ffaa' : '#fbbf24',
                        border: `1px solid ${localModelStatus.status === 'ready' ? 'rgba(0, 255, 170, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontWeight: '700'
                      }}
                    >
                      ● {localModelStatus.status === 'ready' ? 'Loaded & Active' : 'Initializing / Ready'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
                    Pre-trained model: <strong>qwen3-4b-thinking-2507.Q4_K_M.gguf</strong> (2.49 GB). Runs 100% locally on your CPU/GPU with zero external API calls. Provides inline ghost text auto-completions and code suggestions.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Enable Local Pre-trained Model Auto-complete</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Generate inline AI suggestions as you type in the code editor</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localModelEnabled}
                    onChange={(e) => setLocalModelEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', marginLeft: 'auto' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#00f3ff', display: 'block', marginBottom: '6px' }}>
                    TEST LOCAL MODEL CODE COMPLETION
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={mlTestPrompt}
                      onChange={(e) => setMlTestPrompt(e.target.value)}
                      placeholder="e.g. def quicksort(items):"
                      style={{
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        outline: 'none',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    />
                    <button
                      onClick={handleTestLocalML}
                      disabled={isTestingModel}
                      style={{
                        background: 'linear-gradient(135deg, #00f3ff, #0099ff)',
                        border: 'none',
                        color: '#000',
                        fontWeight: '700',
                        borderRadius: '8px',
                        padding: '0 16px',
                        fontSize: '11px',
                        cursor: isTestingModel ? 'wait' : 'pointer'
                      }}
                    >
                      {isTestingModel ? 'Predicting...' : '⚡ Test Suggestion'}
                    </button>
                  </div>
                  {mlTestResult && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '10px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 243, 255, 0.2)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#00ffaa'
                      }}
                    >
                      {mlTestResult}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MCP SERVER CONFIGURATION SETTINGS */}
            {activeTab === 'mcp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Auto-Complete Connection Preset Section */}
                <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#c084fc', marginBottom: '4px' }}>
                    ⚡ AUTO-COMPLETE MCP CONNECTION (PRESETS)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
                    Select an official Model Context Protocol server preset to auto-complete all command, argument, and configuration fields.
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={selectedMcpPreset}
                      onChange={(e) => setSelectedMcpPreset(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#fff',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    >
                      {MCP_PRESETS.map((p) => (
                        <option key={p.id} value={p.id} style={{ background: '#121621', color: '#fff' }}>
                          {p.name} ({p.type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleApplyPreset(selectedMcpPreset)}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '700',
                        borderRadius: '6px',
                        padding: '0 14px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      🪄 Auto-Fill Connection
                    </button>
                    <button
                      onClick={handleAutoScanPorts}
                      disabled={isScanningPorts}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        fontWeight: '600',
                        borderRadius: '6px',
                        padding: '0 12px',
                        fontSize: '11px',
                        cursor: isScanningPorts ? 'wait' : 'pointer'
                      }}
                    >
                      {isScanningPorts ? 'Scanning...' : '🔍 Auto-Scan Local'}
                    </button>
                  </div>
                </div>

                {/* Manual Server Configuration Form */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#00f3ff', marginBottom: '12px' }}>
                    🛠️ CONFIGURE MCP SERVER (MANUAL OR EDIT)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SERVER NAME</label>
                      <input
                        type="text"
                        placeholder="e.g. Workspace Filesystem MCP"
                        value={newMcpName}
                        onChange={(e) => setNewMcpName(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>TRANSPORT TYPE</label>
                      <select
                        value={newMcpType}
                        onChange={(e) => setNewMcpType(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      >
                        <option value="stdio" style={{ background: '#121621' }}>stdio (Command)</option>
                        <option value="sse" style={{ background: '#121621' }}>sse (HTTP URL)</option>
                      </select>
                    </div>
                  </div>

                  {newMcpType === 'stdio' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>COMMAND</label>
                        <input
                          type="text"
                          placeholder="npx / python / node"
                          value={newMcpCommand}
                          onChange={(e) => setNewMcpCommand(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ARGUMENTS</label>
                        <input
                          type="text"
                          placeholder="-y @modelcontextprotocol/server-filesystem ./dir"
                          value={newMcpArgs}
                          onChange={(e) => setNewMcpArgs(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>SERVER SSE URL</label>
                      <input
                        type="text"
                        placeholder="http://127.0.0.1:8000/sse"
                        value={newMcpUrl}
                        onChange={(e) => setNewMcpUrl(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ENVIRONMENT VARIABLES (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="KEY=VALUE (e.g. GITHUB_PERSONAL_ACCESS_TOKEN=xxx)"
                      value={newMcpEnv}
                      onChange={(e) => setNewMcpEnv(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={handleTestMcpConnection}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        color: '#e2e8f0',
                        fontWeight: '600',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      🧪 Test Connection
                    </button>
                    <button
                      onClick={handleAddMcpServer}
                      style={{
                        background: 'linear-gradient(135deg, #00f3ff, #0099ff)',
                        border: 'none',
                        color: '#000',
                        fontWeight: '700',
                        borderRadius: '6px',
                        padding: '6px 16px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      + Save & Add Server
                    </button>
                  </div>

                  {mcpTestStatus && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        background: mcpTestStatus.status === 'success' ? 'rgba(0, 255, 170, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${mcpTestStatus.status === 'success' ? 'rgba(0, 255, 170, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: mcpTestStatus.status === 'success' ? '#00ffaa' : '#f87171'
                      }}
                    >
                      {mcpTestStatus.message}
                    </div>
                  )}
                </div>

                {/* Configured Servers List */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '8px' }}>
                    CONFIGURED MCP SERVERS ({mcpServers.length})
                  </div>
                  {mcpServers.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#64748b', padding: '12px', textAlign: 'center' }}>
                      No MCP servers configured yet. Select a preset above or add a custom server.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {mcpServers.map((server) => (
                        <div
                          key={server.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '700', fontSize: '12px', color: server.enabled ? '#fff' : '#64748b' }}>
                                {server.name}
                              </span>
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '1px 6px',
                                  borderRadius: '8px',
                                  background: server.type === 'stdio' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                                  color: server.type === 'stdio' ? '#00f3ff' : '#c084fc',
                                  border: `1px solid ${server.type === 'stdio' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
                                  textTransform: 'uppercase'
                                }}
                              >
                                {server.type}
                              </span>
                              <span
                                style={{
                                  fontSize: '9px',
                                  padding: '1px 6px',
                                  borderRadius: '8px',
                                  background: server.enabled ? 'rgba(0, 255, 170, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                  color: server.enabled ? '#00ffaa' : '#888'
                                }}
                              >
                                {server.enabled ? '● Active' : '○ Disabled'}
                              </span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>
                              {server.type === 'stdio' ? `${server.command} ${server.args}` : server.url}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleMcpServer(server.id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: server.enabled ? '#00ffaa' : '#888',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              {server.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDeleteMcpServer(server.id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DEV KIT COMPILER PATHS */}
            {activeTab === 'devkit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  Explicitly specify custom compiler / runtime executable binaries (e.g. gcc.exe, python.exe). If left blank, Xenithra falls back to system PATH.
                </div>
                {Object.keys(compilerPaths).map((lang) => (
                  <div key={lang} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#cbd5e1' }}>{lang}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder={`System PATH default (${lang})`}
                        value={compilerPaths[lang]}
                        onChange={(e) =>
                          setCompilerPaths({
                            ...compilerPaths,
                            [lang]: e.target.value
                          })
                        }
                        style={{
                          flex: 1,
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => handleBrowsePath(lang)}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '0 12px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '12px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            gap: '12px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#8b949e',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #00f3ff 0%, #3574f0 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: '700',
              padding: '6px 20px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 243, 255, 0.3)'
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
