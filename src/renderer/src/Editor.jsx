import { useState } from 'react'

const Editor = () => {
  const [fileTree, setFileTree] = useState([])
  const [baseDir, setBaseDir] = useState('')
  const [editor, setEditor] = useState('')
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOpenDir = async () => {
    if (!baseDir.trim()) {
      alert('Enter an absolute base directory path')
      return
    }
    setLoading(true)
    await loadDir('.')
    setLoading(false)
  }

  const loadDir = async (relPath) => {
    try {
      const res = await fetch(
        `/api/editor/list?base=${encodeURIComponent(baseDir)}&path=${encodeURIComponent(relPath)}`
      )
      const data = await res.json()
      if (!data.success) {
        alert(data.error || 'Failed to list')
        return
      }
      setFileTree(data.entries || [])
    } catch {
      alert('Network error while listing directory')
    }
  }

  const handleOpenFile = async (fileName, isDirectory, relPath) => {
    if (isDirectory) {
      await loadDir((relPath === '.' ? '' : relPath + '/') + fileName)
    } else {
      const fileRel = (relPath === '.' ? '' : relPath + '/') + fileName
      await openFile(fileRel)
    }
  }

  const openFile = async (relPath) => {
    try {
      const res = await fetch('/api/editor/read?base=' + encodeURIComponent(baseDir), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relPath })
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error || 'Failed to open')
        return
      }
      setEditor(data.content)
      setCurrentPath(relPath)
    } catch (err) {
      alert(`Network error while opening file${err}`)
    }
  }

  const handleSave = async () => {
    if (!currentPath) return alert('No file open')
    try {
      const res = await fetch('/api/editor/write?base=' + encodeURIComponent(baseDir), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, content: editor })
      })
      const data = await res.json()
      if (!data.success) return alert(data.error || 'Save failed')
      alert('Saved')
    } catch (err) {
      alert('Network error while saving file', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([editor], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    const name = currentPath ? currentPath.split('/').pop() : 'file.txt'
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#f8f9fa', padding: '10px', borderBottom: '1px solid #dee2e6' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Base directory (absolute)"
            value={baseDir}
            onChange={(e) => setBaseDir(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              maxWidth: '360px'
            }}
          />
          <button
            onClick={handleOpenDir}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Open Directory'}
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, gap: '10px', padding: '10px' }}>
        <div
          style={{
            flex: '0 0 25%',
            background: '#f7f7f8',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            overflow: 'auto'
          }}
        >
          {fileTree.map((item, index) => (
            <div
              key={index}
              onClick={() => handleOpenFile(item.name, item.isDirectory, '')}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #e9ecef'
              }}
              onMouseOver={(e) => (e.target.style.background = '#e9ecef')}
              onMouseOut={(e) => (e.target.style.background = 'transparent')}
            >
              {item.name}
              {item.isDirectory ? '/' : ''}
            </div>
          ))}
        </div>

        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Current file"
              value={currentPath}
              readOnly
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #ced4da',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={handleSave}
              style={{
                padding: '6px 12px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: '6px 12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Download
            </button>
          </div>
          <textarea
            value={editor}
            onChange={(e) => setEditor(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Editor
