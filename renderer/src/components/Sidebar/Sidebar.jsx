import React, { useState, useEffect } from 'react'
import GitPanel from './GitPanel'
import SearchPanel from './SearchPanel'
import DebugPanel from '../ui/DebugPanel'
import DockerPanel from '../ui/DockerPanel'
import FirebasePanel from './FirebasePanel'

const Sidebar = ({ collapsed, sidebarWidth, activeActivity }) => {
  const [loadedFolder, setLoadedFolder] = useState(null) // { name: '', path: '', tree: {} }
  const [activeFile, setActiveFile] = useState('')
  const [expandedDirs, setExpandedDirs] = useState({})
  const [isDragOver, setIsDragOver] = useState(false)
  const [installedExtensions, setInstalledExtensions] = useState([])
  const [extSearchQuery, setExtSearchQuery] = useState('')

  const storeExtensions = [
    { id: 'firebase-extension', name: 'Firebase Console Extension', version: '1.0.0', description: 'Firebase hosting deployment, auth database viewer, and firestore client.' },
    { id: 'github-theme', name: 'GitHub Theme Pack', version: '1.2.0', description: 'Clean GitHub dark and light themes.' },
    { id: 'python-diagnostics', name: 'Python Diagnostics', version: '2.1.0', description: 'Real-time linting, formatting and troubleshooting.' },
    { id: 'cpp-toolchain', name: 'C++ Compiler Suite', version: '1.0.5', description: 'Enables C++ execution environment and flags.' },
    { id: 'markdown-preview', name: 'Markdown Previewer', version: '1.5.0', description: 'Renders Markdown documentation in side panel.' },
    { id: 'vim-keybindings', name: 'Vim Keybindings', version: '0.9.0', description: 'Vim style inputs and movements in editor.' },
    { id: 'devtools-helper', name: 'DevTools Helper', version: '1.1.0', description: 'Extra debugging utilities and log consoles.' }
  ]

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

  // Listen to native open-directory events
  useEffect(() => {
    const handleOpenDirectory = (event) => {
      if (event.detail && event.detail.tree) {
        setLoadedFolder(event.detail)
        if (event.detail.path) {
          localStorage.setItem('activeWorkspacePath', event.detail.path)
        }
        setExpandedDirs({ [event.detail.tree.key]: true })
      }
    }
    const handleCloseDirectory = () => {
      setLoadedFolder(null)
      localStorage.removeItem('activeWorkspacePath')
    }
    window.addEventListener('open-directory', handleOpenDirectory)
    window.addEventListener('close-directory', handleCloseDirectory)
    return () => {
      window.removeEventListener('open-directory', handleOpenDirectory)
      window.removeEventListener('close-directory', handleCloseDirectory)
    }
  }, [])

  // Read installed extensions on load
  useEffect(() => {
    if (window.api && typeof window.api.getExtensions === 'function') {
      window.api.getExtensions().then(exts => {
        setInstalledExtensions(exts || [])
      })
    }
  }, [])

  // Auto-restore workspace folder tree on mount (e.g., after sign in or page refresh)
  useEffect(() => {
    const savedPath = localStorage.getItem('activeWorkspacePath')
    if (savedPath && !loadedFolder && window.api && typeof window.api.readDirectory === 'function') {
      window.api.readDirectory(savedPath).then(dirResult => {
        if (dirResult && dirResult.tree) {
          setLoadedFolder(dirResult)
          setExpandedDirs({ [dirResult.tree.key]: true })
        }
      }).catch(err => {
        console.warn('Auto-restore directory error:', err)
      })
    }
  }, [])

  const handleInstallExtension = async (ext) => {
    const updated = [...installedExtensions, ext]
    setInstalledExtensions(updated)
    if (window.api && typeof window.api.saveExtensions === 'function') {
      await window.api.saveExtensions(updated)
    }
  }

  const handleUninstallExtension = async (extId) => {
    const updated = installedExtensions.filter(e => e.id !== extId)
    setInstalledExtensions(updated)
    if (window.api && typeof window.api.saveExtensions === 'function') {
      await window.api.saveExtensions(updated)
    }
  }

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
        if (result.path) {
          localStorage.setItem('activeWorkspacePath', result.path)
        }
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
          if (result.path) {
            localStorage.setItem('activeWorkspacePath', result.path)
          }
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
    if (!node) return null
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
      {activeActivity === 'search' ? (
        <SearchPanel />
      ) : activeActivity === 'git' ? (
        <GitPanel />
      ) : activeActivity === 'debug' ? (
        <DebugPanel activeFile={activeFile} />
      ) : activeActivity === 'docker' ? (
        <DockerPanel />
      ) : activeActivity === 'firebase' ? (
        <FirebasePanel />
      ) : activeActivity === 'settings' ? (
        <div style={{ padding: '12px', color: 'var(--text-main)', fontSize: '12px', height: '100%', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '12px', color: 'var(--accent-color)' }}>
            STUDIO SETTINGS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Deep Link Protocol Handover</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered URI Scheme: <code>xenithra://token:</code></div>
              <div style={{ fontSize: '10px', color: '#00ffaa', marginTop: '4px' }}>✓ Active & Listening for Web Redirects</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Active Directory Workspace</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {localStorage.getItem('activeWorkspacePath') || 'No workspace directory mounted'}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Environment Configuration</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Compiler Engine Port: {localStorage.getItem('api-port') || '8000'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Active Theme: {(localStorage.getItem('theme') || 'vscode-dark').replace('-', ' ')}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>⚡ Code Snippets (Auto-Pull)</span>
                <span style={{ fontSize: '9px', background: 'rgba(0,255,170,0.15)', color: '#00ffaa', padding: '2px 6px', borderRadius: '10px' }}>Auto Sync</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Click any snippet to auto-pull template directly into your active editor.
              </div>
              <button 
                onClick={() => window.location.hash = '#/preferences'}
                style={{ width: '100%', background: 'rgba(0, 255, 170, 0.1)', border: '1px solid rgba(0, 255, 170, 0.25)', color: 'var(--accent-color)', borderRadius: '4px', padding: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}
              >
                ⚙ Manage Custom Snippets & Keys
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { name: 'React Component (JSX)', lang: 'jsx', code: "import React from 'react';\n\nexport default function App() {\n  return (\n    <div className=\"p-4\">\n      <h1>Hello Xenithra</h1>\n    </div>\n  );\n}" },
                  { name: 'Express API Server', lang: 'js', code: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\napp.get('/api/health', (req, res) => res.json({ status: 'ok' }));\napp.listen(3001, () => console.log('Server running on 3001'));" },
                  { name: 'Python Async Main', lang: 'py', code: "import asyncio\n\nasync def main():\n    print('Running Xenithra Python Engine...')\n\nif __name__ == '__main__':\n    asyncio.run(main())" },
                  { name: 'C++ Starter Template', lang: 'cpp', code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Xenithra C++ Engine Active\" << endl;\n    return 0;\n}" }
                ].map((snip, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500' }}>{snip.name}</span>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-file', {
                          detail: { filename: `template_${snip.lang}.${snip.lang}`, code: snip.code }
                        }))
                      }}
                      style={{ background: 'var(--accent-color)', border: 'none', color: '#000', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Auto-Pull
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeActivity === 'extensions' ? (
        /* Extensions Panel View */
        <div className="extensions-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em', color: 'var(--text-main)' }}>EXTENSION STORE</span>
            <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '10px', color: 'var(--accent-color)' }}>
              {installedExtensions.length} Installed
            </span>
          </div>
          
          <input 
            type="text"
            className="extensions-search"
            placeholder="Search extensions..."
            value={extSearchQuery}
            onChange={(e) => setExtSearchQuery(e.target.value)}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="extensions-list-header">Installed</div>
            {installedExtensions
              .filter(ext => ext.name.toLowerCase().includes(extSearchQuery.toLowerCase()))
              .map(ext => (
                <div key={ext.id} className="extensions-item">
                  <div className="extensions-item-icon">
                    <i className="bx bx-plug"></i>
                  </div>
                  <div className="extensions-item-info">
                    <div className="extensions-item-name">{ext.name}</div>
                    <div className="extensions-item-desc">{ext.description}</div>
                    <div className="extensions-item-footer">
                      <span className="extensions-item-version">v{ext.version || '1.0.0'}</span>
                      <button 
                        className="extensions-btn-uninstall"
                        onClick={() => handleUninstallExtension(ext.id)}
                      >
                        Uninstall
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {installedExtensions.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                No extensions installed yet.
              </div>
            )}

            <div className="extensions-list-header">Available from Store</div>
            {storeExtensions
              .filter(ext => !installedExtensions.some(e => e.id === ext.id))
              .filter(ext => ext.name.toLowerCase().includes(extSearchQuery.toLowerCase()))
              .map(ext => (
                <div key={ext.id} className="extensions-item">
                  <div className="extensions-item-icon">
                    <i className="bx bx-package"></i>
                  </div>
                  <div className="extensions-item-info">
                    <div className="extensions-item-name">{ext.name}</div>
                    <div className="extensions-item-desc">{ext.description}</div>
                    <div className="extensions-item-footer">
                      <span className="extensions-item-version">v{ext.version}</span>
                      <button 
                        className="extensions-btn-install"
                        onClick={() => handleInstallExtension(ext)}
                      >
                        Install
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : loadedFolder ? (
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
