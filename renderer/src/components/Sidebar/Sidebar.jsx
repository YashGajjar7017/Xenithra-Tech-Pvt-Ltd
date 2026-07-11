import React, { useState, useEffect } from 'react'

const Sidebar = ({ collapsed, sidebarWidth }) => {
  const [activeFile, setActiveFile] = useState('index.html')
  const [expandedDirs, setExpandedDirs] = useState({
    'my-project': true,
    'src': true,
    'public': false,
    'config': false
  })

  // Simulated project files tree
  const fileTree = {
    name: 'MY-PROJECT',
    isDir: true,
    key: 'my-project',
    children: [
      {
        name: 'src',
        isDir: true,
        key: 'src',
        children: [
          { name: 'index.html', isDir: false, key: 'index.html', content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>` },
          { name: 'main.js', isDir: false, key: 'main.js', content: `console.log("Hello from Xenithra IDE!");\n\nconst greet = (name) => {\n  console.log(\`Greetings, \${name}!\`);\n};\n\ngreet("Developer");` },
          { name: 'style.css', isDir: false, key: 'style.css', content: `body {\n  margin: 0;\n  background: #111;\n  color: #fff;\n  font-family: sans-serif;\n}` }
        ]
      },
      {
        name: 'public',
        isDir: true,
        key: 'public',
        children: [
          { name: 'favicon.ico', isDir: false, key: 'favicon.ico', content: '(Binary Favicon Data)' }
        ]
      },
      {
        name: 'config',
        isDir: true,
        key: 'config',
        children: [
          { name: 'webpack.config.js', isDir: false, key: 'webpack.config.js', content: 'module.exports = {\n  entry: "./src/main.js"\n};' }
        ]
      },
      { name: 'README.md', isDir: false, key: 'README.md', content: '# My Project\n\nA sample project to get started with the Xenithra IDE.\n\n## Features\n- File editing\n- AI Assistant support\n- Terminal output' },
      { name: 'utils.js', isDir: false, key: 'utils.js', content: 'export const delay = ms => new Promise(res => setTimeout(res, ms));' }
    ]
  }

  const toggleDirExpand = (dirKey) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirKey]: !prev[dirKey]
    }))
  }

  const handleFileClick = (file) => {
    setActiveFile(file.key)
    // Dispatch custom event to let EditorPage update code content
    window.dispatchEvent(new CustomEvent('open-file', { 
      detail: { 
        filename: file.name,
        code: file.content
      } 
    }))
  }

  // Render file tree recursively with styling
  const renderTree = (node, depth = 0) => {
    const isExpanded = expandedDirs[node.key]
    const indent = depth * 12

    if (node.isDir) {
      return (
        <div key={node.key}>
          <div
            onClick={() => toggleDirExpand(node.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px 6px ' + (indent + 12) + 'px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: depth === 0 ? '600' : 'normal',
              color: depth === 0 ? 'var(--text-main)' : 'var(--text-muted)',
              transition: 'background 0.2s',
              gap: '6px',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: '9px', opacity: 0.6 }}>{isExpanded ? '▼' : '▶'}</span>
            <span>📁</span>
            <span style={{ letterSpacing: depth === 0 ? '0.04em' : 'normal' }}>{node.name}</span>
          </div>
          
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderTree(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    const isActive = activeFile === node.key

    return (
      <div
        key={node.key}
        onClick={() => handleFileClick(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 12px 5px ' + (indent + 22) + 'px',
          cursor: 'pointer',
          fontSize: '12px',
          color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
          background: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
          gap: '6px',
          userSelect: 'none',
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        <span>📄</span>
        <span>{node.name}</span>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div style={{ width: '60px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', gap: '20px' }}>
        <div style={{ fontSize: '18px', cursor: 'pointer', opacity: 0.6 }} title="Expand Explorer">📂</div>
        <div style={{ fontSize: '18px', cursor: 'pointer', opacity: 0.6 }} title="Open Editors">📄</div>
      </div>
    )
  }

  return (
    <div style={{ width: `${sidebarWidth}px`, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--panel-border)' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '0.08em' }}>EXPLORER</span>
        <div style={{ display: 'flex', gap: '8px', opacity: 0.7, fontSize: '12px' }}>
          <span style={{ cursor: 'pointer' }} title="New File">📄</span>
          <span style={{ cursor: 'pointer' }} title="New Folder">📁</span>
          <span style={{ cursor: 'pointer' }} title="Refresh Explorer">↻</span>
        </div>
      </div>

      {/* Open Editors Section */}
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          ▼ OPEN EDITORS
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 22px',
          fontSize: '12px',
          cursor: 'pointer',
          color: 'var(--accent-color)',
          background: 'rgba(0, 229, 255, 0.04)',
          gap: '6px'
        }}>
          <span>📄</span>
          <span>{activeFile.split('/').pop()}</span>
        </div>
      </div>

      {/* Project Folder Explorer */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
        {renderTree(fileTree)}
      </div>
    </div>
  )
}

export default Sidebar
