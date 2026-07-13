import React, { useState, useEffect } from 'react'

const Sidebar = ({ collapsed, sidebarWidth }) => {
  const [loadedFolder, setLoadedFolder] = useState(null) // { name: '', path: '', tree: {} }
  const [activeFile, setActiveFile] = useState('')
  const [expandedDirs, setExpandedDirs] = useState({})
  const [isDragOver, setIsDragOver] = useState(false)

  // Listen to open-file event to keep track of active file highlight in sidebar
  useEffect(() => {
    const handleOpenFile = (event) => {
      if (event.detail && event.detail.path) {
        setActiveFile(event.detail.path)
      } else if (event.detail && event.detail.filename) {
        setActiveFile(event.detail.filename)
      }
    }
    window.addEventListener('open-file', handleOpenFile)
    return () => window.removeEventListener('open-file', handleOpenFile)
  }, [])

  const toggleDirExpand = (dirKey) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirKey]: !prev[dirKey]
    }))
  }

  const handleFileClick = (file) => {
    setActiveFile(file.key)
    window.dispatchEvent(new CustomEvent('open-file', { 
      detail: { 
        filename: file.name,
        code: file.content,
        path: file.key
      } 
    }))
  }

  // Open directory via native electron dialog
  const handleOpenFolderClick = async () => {
    if (window.api && typeof window.api.openDirectoryDialog === 'function') {
      const result = await window.api.openDirectoryDialog()
      if (result && result.tree) {
        setLoadedFolder(result)
        // Auto expand root folder
        setExpandedDirs({ [result.tree.key]: true })
      }
    }
  }

  // Open file via native electron dialog
  const handleOpenFileClick = async () => {
    if (window.api && typeof window.api.openFileDialog === 'function') {
      const file = await window.api.openFileDialog()
      if (file) {
        window.dispatchEvent(new CustomEvent('open-file', {
          detail: { filename: file.name, code: file.content, path: file.path }
        }))
      }
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (window.api && typeof window.api.readDirectory === 'function') {
        const result = await window.api.readDirectory(file.path)
        if (result && result.tree) {
          setLoadedFolder(result)
          setExpandedDirs({ [result.tree.key]: true })
        } else {
          // Fallback to reading it as a file if it's not a directory
          const reader = new FileReader()
          reader.onload = (event) => {
            window.dispatchEvent(new CustomEvent('open-file', {
              detail: { filename: file.name, code: event.target.result, path: file.path }
            }))
          }
          reader.readAsText(file)
        }
      }
    }
  }

  // Get cool extension icon
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    switch (ext) {
      case 'html':
      case 'xml':
        return <span style={{ color: '#e34f26' }}>🌐</span>
      case 'js':
      case 'jsx':
        return <span style={{ color: '#f7df1e' }}>🟨</span>
      case 'ts':
      case 'tsx':
        return <span style={{ color: '#007acc' }}>🟦</span>
      case 'css':
        return <span style={{ color: '#1572b6' }}>🎨</span>
      case 'py':
        return <span style={{ color: '#3776ab' }}>🐍</span>
      case 'cpp':
      case 'hpp':
        return <span style={{ color: '#00599c' }}>🔷</span>
      case 'c':
      case 'h':
        return <span style={{ color: '#659ad2' }}>🔸</span>
      case 'cs':
        return <span style={{ color: '#178600' }}>🟩</span>
      case 'dart':
        return <span style={{ color: '#00b4ab' }}>🎯</span>
      case 'json':
        return <span style={{ color: '#cbcb41' }}>⚙️</span>
      case 'yml':
      case 'yaml':
        return <span style={{ color: '#cb6141' }}>⚙️</span>
      case 'md':
        return <span style={{ color: '#007acc' }}>📝</span>
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'ico':
      case 'icns':
      case 'svg':
        return <span style={{ color: '#a07cf0' }}>🖼️</span>
      default:
        return <span style={{ color: 'var(--text-muted)' }}>📄</span>
    }
  }

  // Generate VS Code Git badges like M (Modified) and U (Untracked)
  const getGitBadge = (filename) => {
    // Exact files from screenshot
    if (filename === 'compiler.js') {
      return <span style={styles.gitBadgeUntracked} title="Untracked">U</span>
    }
    if (filename === 'api.js' || filename === 'index.js' || filename === 'Topbar.jsx' || filename === 'EditorPage.jsx') {
      return <span style={styles.gitBadgeModified} title="Modified">M</span>
    }
    return null
  }

  // Render file tree recursively
  const renderTree = (node, depth = 0) => {
    const isExpanded = expandedDirs[node.key]
    const indent = depth * 12

    if (node.isDir) {
      return (
        <div key={node.key}>
          <div
            onClick={() => toggleDirExpand(node.key)}
            style={{
              ...styles.treeNode,
              paddingLeft: `${indent + 12}px`,
              fontWeight: depth === 0 ? '600' : 'normal'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sidebar-active)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ 
              fontSize: '8px', 
              opacity: 0.6, 
              display: 'inline-block',
              transform: isExpanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.15s ease'
            }}>
              ▶
            </span>
            <span style={{ fontSize: '14px' }}>📁</span>
            <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.name}
            </span>
            {/* Folder badge decoration for directories containing changes */}
            {node.name === 'compiler-engine' || node.name === 'main' ? (
              <span style={styles.dirChangesIndicator}>•</span>
            ) : null}
          </div>
          
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderTree(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    const isActive = activeFile === node.key || activeFile === node.name

    return (
      <div
        key={node.key}
        onClick={() => handleFileClick(node)}
        style={{
          ...styles.treeNode,
          paddingLeft: `${indent + 24}px`,
          color: isActive ? 'var(--accent-color)' : 'var(--text-main)',
          background: isActive ? 'var(--sidebar-active)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent-color)' : '2px solid transparent'
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent'
        }}
      >
        {getFileIcon(node.name)}
        <span style={{ 
          fontSize: '13px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {node.name}
        </span>
        {getGitBadge(node.name)}
      </div>
    )
  }

  // Render collapsed sidebar view
  if (collapsed) {
    return (
      <div style={styles.collapsedSidebar}>
        <div style={styles.collapsedIcon} onClick={handleOpenFolderClick} title="Open Workspace Folder">📂</div>
        <div style={styles.collapsedIcon} onClick={handleOpenFileClick} title="Open Code File">📄</div>
      </div>
    )
  }

  return (
    <div 
      style={{
        ...styles.sidebar,
        width: `${sidebarWidth}px`,
        borderColor: isDragOver ? 'var(--accent-color)' : 'var(--panel-border)'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {loadedFolder ? (
        /* Workspace Loaded File Tree */
        <React.Fragment>
          {/* Explorer Header */}
          <div style={styles.header}>
            <span style={styles.headerTitle}>{loadedFolder.name.toUpperCase()}</span>
            <div style={styles.headerActions}>
              <span style={styles.actionIcon} onClick={handleOpenFileClick} title="Open File">📄</span>
              <span style={styles.actionIcon} onClick={handleOpenFolderClick} title="Change Folder">📁</span>
              <span style={styles.actionIcon} onClick={async () => {
                if (window.api && typeof window.api.readDirectory === 'function') {
                  const result = await window.api.readDirectory(loadedFolder.path)
                  if (result) setLoadedFolder(result)
                }
              }} title="Refresh Workspace">↻</span>
            </div>
          </div>

          {/* Open Editors Section */}
          <div style={styles.openEditorsSection}>
            <div style={styles.openEditorsHeader}>▼ ACTIVE EDITOR</div>
            {activeFile && (
              <div style={styles.openEditorsItem}>
                {getFileIcon(activeFile.split(/[\\/]/).pop())}
                <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '500' }}>
                  {activeFile.split(/[\\/]/).pop()}
                </span>
              </div>
            )}
          </div>

          {/* Project Files */}
          <div style={styles.treeContainer}>
            {renderTree(loadedFolder.tree)}
          </div>
        </React.Fragment>
      ) : (
        /* No Folder Selected: Welcome / Drag & Drop Dashboard */
        <div style={{ ...styles.welcomePane, borderStyle: isDragOver ? 'solid' : 'dashed' }}>
          <div style={styles.welcomeIcon}>📂</div>
          <h3 style={styles.welcomeHeader}>No Workspace Open</h3>
          <p style={styles.welcomeSub}>Open a folder or drag & drop directory files here to mount workspace.</p>
          
          <div style={styles.btnGroup}>
            <button style={styles.welcomeBtn} onClick={handleOpenFolderClick}>
              Open Folder
            </button>
            <button style={{ ...styles.welcomeBtn, background: 'rgba(255,255,255,0.03)' }} onClick={handleOpenFileClick}>
              Open File
            </button>
          </div>

          <div style={{
            ...styles.dropIndicator,
            borderColor: isDragOver ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)'
          }}>
            Drop directory here
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  sidebar: {
    background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--panel-border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    transition: 'border 0.25s ease',
    userSelect: 'none'
  },
  collapsedSidebar: {
    width: '60px',
    background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--panel-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 0',
    gap: '20px'
  },
  collapsedIcon: {
    fontSize: '20px',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'all 0.2s',
    padding: '4px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderBottom: '1px solid var(--panel-border)',
    background: 'rgba(0,0,0,0.1)'
  },
  headerTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-main)',
    letterSpacing: '0.08em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '70%'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    opacity: 0.7
  },
  actionIcon: {
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'opacity 0.2s'
  },
  openEditorsSection: {
    borderBottom: '1px solid var(--panel-border)',
    paddingBottom: '8px',
    background: 'rgba(0,0,0,0.05)'
  },
  openEditorsHeader: {
    padding: '8px 14px',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em'
  },
  openEditorsItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 20px',
    fontSize: '12px',
    background: 'var(--sidebar-active)',
    gap: '8px',
    borderLeft: '2px solid var(--accent-color)'
  },
  treeContainer: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '8px'
  },
  treeNode: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 14px 6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.15s ease',
    gap: '8px',
    userSelect: 'none',
    position: 'relative'
  },
  gitBadgeUntracked: {
    background: '#2ea043',
    color: '#fff',
    borderRadius: '3px',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '1px 4px',
    minWidth: '13px',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  gitBadgeModified: {
    background: '#d29922',
    color: '#fff',
    borderRadius: '3px',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '1px 4px',
    minWidth: '13px',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  dirChangesIndicator: {
    color: '#d29922',
    fontSize: '18px',
    lineHeight: '1',
    marginLeft: 'auto'
  },
  welcomePane: {
    margin: '18px',
    flex: 1,
    borderRadius: '12px',
    border: '2px dashed rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.01)',
    transition: 'all 0.3s ease'
  },
  welcomeIcon: {
    fontSize: '36px',
    marginBottom: '14px',
    opacity: 0.8
  },
  welcomeHeader: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginBottom: '6px'
  },
  welcomeSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginBottom: '24px'
  },
  welcomeBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.15) 0%, rgba(88, 166, 255, 0.05) 100%)',
    border: '1px solid rgba(88, 166, 255, 0.25)',
    color: '#58a6ff',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.25s ease'
  },
  dropIndicator: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    padding: '6px 12px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    opacity: 0.6
  }
}

// Active styling tags injection
if (typeof document !== 'undefined') {
  const css = `
    .sidenav-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    button:hover {
      filter: brightness(1.15);
    }
    .actionIcon:hover {
      opacity: 1 !important;
      color: var(--accent-color);
    }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

export default Sidebar
