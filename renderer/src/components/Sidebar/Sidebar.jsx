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

  const handleFileClick = async (file) => {
    setActiveFile(file.key)
    let content = file.content
    // If the file content is empty or cached as empty, check if we need to load it dynamically
    if ((content === undefined || content === '') && window.api && typeof window.api.readFile === 'function') {
      const fetchedContent = await window.api.readFile(file.key)
      if (fetchedContent !== null) {
        content = fetchedContent
      }
    }
    window.dispatchEvent(new CustomEvent('open-file', { 
      detail: { 
        filename: file.name,
        code: content,
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
          if (window.api && typeof window.api.readFile === 'function') {
            const content = await window.api.readFile(file.path)
            window.dispatchEvent(new CustomEvent('open-file', {
              detail: { filename: file.name, code: content || '', path: file.path }
            }))
          }
        }
      }
    }
  }

  // Get flat monochrome Boxicons
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    const iconStyle = { fontSize: '15px', color: 'var(--text-main)', opacity: 0.75 }
    
    switch (ext) {
      case 'html':
      case 'xml':
        return <i className="bx bx-code" style={iconStyle}></i>
      case 'js':
      case 'jsx':
        return <i className="bx bxl-javascript" style={iconStyle}></i>
      case 'ts':
      case 'tsx':
        return <i className="bx bx-code-block" style={iconStyle}></i>
      case 'css':
        return <i className="bx bx-palette" style={iconStyle}></i>
      case 'py':
        return <i className="bx bxl-python" style={iconStyle}></i>
      case 'cpp':
      case 'hpp':
      case 'c':
      case 'h':
      case 'cs':
      case 'dart':
        return <i className="bx bx-terminal" style={iconStyle}></i>
      case 'json':
      case 'yml':
      case 'yaml':
        return <i className="bx bx-cog" style={iconStyle}></i>
      case 'md':
        return <i className="bx bx-detail" style={iconStyle}></i>
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'ico':
      case 'icns':
      case 'svg':
        return <i className="bx bx-image" style={iconStyle}></i>
      default:
        return <i className="bx bx-file" style={iconStyle}></i>
    }
  }

  // Generate VS Code Git badges like M (Modified) and U (Untracked)
  const getGitBadge = (filename) => {
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
            <i className="bx bx-folder" style={{ fontSize: '15px', color: 'var(--text-main)', opacity: 0.75 }}></i>
            <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.name}
            </span>
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

  // Prevent double-sidebar rendering by returning null when collapsed
  if (collapsed) {
    return null
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
              <span style={styles.actionIcon} onClick={handleOpenFileClick} title="Open File">
                <i className="bx bx-file" style={{ fontSize: '13px' }}></i>
              </span>
              <span style={styles.actionIcon} onClick={handleOpenFolderClick} title="Change Folder">
                <i className="bx bx-folder" style={{ fontSize: '13px' }}></i>
              </span>
              <span style={styles.actionIcon} onClick={async () => {
                if (window.api && typeof window.api.readDirectory === 'function') {
                  const result = await window.api.readDirectory(loadedFolder.path)
                  if (result) setLoadedFolder(result)
                }
              }} title="Refresh Workspace">
                <i className="bx bx-refresh" style={{ fontSize: '13px' }}></i>
              </span>
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
        /* Welcome / Drag & Drop Dashboard with Flat Monochrome Design */
        <div style={{ ...styles.welcomePane, borderStyle: isDragOver ? 'solid' : 'dashed' }}>
          <div style={styles.welcomeIcon}>
            <i className="bx bx-folder-open" style={{ fontSize: '42px', opacity: 0.7 }}></i>
          </div>
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
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center'
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
    background: '#2d3b2f',
    color: '#8be9fd',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '1px 5px',
    border: '1px solid rgba(139, 233, 253, 0.2)',
    minWidth: '13px',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  gitBadgeModified: {
    background: '#3d301f',
    color: '#ffb86c',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '1px 5px',
    border: '1px solid rgba(255, 184, 108, 0.2)',
    minWidth: '13px',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  dirChangesIndicator: {
    color: '#ffb86c',
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
    marginBottom: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
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
