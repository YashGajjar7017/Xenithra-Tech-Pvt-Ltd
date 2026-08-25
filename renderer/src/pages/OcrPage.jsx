import React, { useState, useEffect, useRef } from 'react'

const OcrPage = () => {
  const [activeTab, setActiveTab] = useState('decoded') // 'decoded', 'encoded'
  const [targetFormat, setTargetFormat] = useState('Base64') // 'Base64', 'JSON', 'HEX', 'ROT13', 'XML'
  const [ocrLanguage, setOcrLanguage] = useState('English')

  // Scanned Document State
  const [docFile, setDocFile] = useState(null) // { name, size, type, previewUrl }
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  // Scanned Text Stats
  const [decodedText, setDecodedText] = useState('')
  const [encodedText, setEncodedText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [language, setLanguage] = useState('English')
  const [blocks, setBlocks] = useState([])

  // History database
  const [history, setHistory] = useState([])
  const [hoveredBlock, setHoveredBlock] = useState(null)

  // Refs
  const fileInputRef = useRef(null)

  // Load history list initially
  const loadHistory = async () => {
    if (window.api && typeof window.api.ocrHistory === 'function') {
      try {
        const list = await window.api.ocrHistory()
        setHistory(list || [])
      } catch (err) {
        console.error('Failed to load OCR history:', err)
      }
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Auto-encode whenever decodedText or targetFormat changes
  useEffect(() => {
    if (!decodedText) {
      setEncodedText('')
      return
    }
    // Perform encoding locally for speed and reactivity
    let encoded = ''
    switch (targetFormat) {
      case 'Base64':
        encoded = btoa(unescape(encodeURIComponent(decodedText)))
        break
      case 'JSON':
        encoded = JSON.stringify(
          {
            documentText: decodedText,
            length: decodedText.length,
            lines: decodedText.split('\n').length,
            timestamp: new Date().toISOString()
          },
          null,
          2
        )
        break
      case 'HEX':
        encoded = Array.from(new TextEncoder().encode(decodedText))
          .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
          .join(' ')
        break
      case 'ROT13':
        encoded = decodedText.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
        })
        break
      case 'XML':
        const escaped = decodedText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
        encoded = `<?xml version="1.0" encoding="UTF-8"?>\n<ocrDocument>\n  <metadata>\n    <timestamp>${new Date().toISOString()}</timestamp>\n    <charCount>${decodedText.length}</charCount>\n  </metadata>\n  <content>\n${escaped
          .split('\n')
          .map((line) => `    <line>${line}</line>`)
          .join('\n')}\n  </content>\n</ocrDocument>`
        break
      default:
        encoded = decodedText
    }
    setEncodedText(encoded)
  }, [decodedText, targetFormat])

  // Handle document scan simulation
  const handleFileScan = async (file) => {
    if (!file) return

    setDocFile({
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file)
    })

    setIsScanning(true)
    setScanProgress(0)
    setDecodedText('')
    setConfidence(0)
    setBlocks([])

    // Animate scanner laser lines
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Complete scan after 2 seconds
    setTimeout(async () => {
      clearInterval(interval)
      if (window.api && typeof window.api.ocrDecode === 'function') {
        try {
          const result = await window.api.ocrDecode(file.name, file.size)
          setDecodedText(result.rawText)
          setConfidence(result.confidence)
          setLanguage(result.language)
          setBlocks(result.blocks || [])

          // Auto-save scan result
          const saveRes = await window.api.ocrSave({
            filename: file.name,
            fileSize: file.size,
            rawText: result.rawText,
            encodingFormat: targetFormat,
            confidence: result.confidence,
            language: result.language,
            mimeType: file.type
          })

          if (saveRes && saveRes.success) {
            loadHistory()
          }
        } catch (err) {
          console.error('OCR Decode failed:', err)
          setDecodedText('Failed to extract text from document.')
        } finally {
          setIsScanning(false)
        }
      }
    }, 2000)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileScan(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleHistoryLoad = (item) => {
    setDocFile({
      name: item.filename,
      size: item.fileSize,
      type: item.mimeType,
      previewUrl: '' // No preview url since it was reloaded from DB
    })
    setDecodedText(item.rawText)
    setConfidence(item.confidence)
    setLanguage(item.language)
    setTargetFormat(item.encodingFormat)
    setBlocks([])
    setActiveTab('decoded')
  }

  const handleHistoryDelete = async (id, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this OCR Document?')) {
      if (window.api && typeof window.api.ocrDelete === 'function') {
        await window.api.ocrDelete(id)
        loadHistory()
      }
    }
  }

  const handleCopyText = () => {
    const textToCopy = activeTab === 'decoded' ? decodedText : encodedText
    navigator.clipboard.writeText(textToCopy)
    alert(`${activeTab === 'decoded' ? 'Decoded' : 'Encoded'} text copied to clipboard!`)
  }

  const handleDownloadText = () => {
    const textToDownload = activeTab === 'decoded' ? decodedText : encodedText
    const ext = activeTab === 'decoded' ? 'txt' : targetFormat.toLowerCase()
    const blob = new Blob([textToDownload], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ocr_export_${docFile?.name || 'document'}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Stats calculation
  const totalScans = history.length
  const avgConfidence =
    history.length > 0
      ? (history.reduce((acc, curr) => acc + curr.confidence, 0) / history.length).toFixed(1)
      : '0.0'
  const latestDoc = history.length > 0 ? history[0].filename : 'None'

  return (
    <div style={styles.container}>
      <div style={styles.dashboard}>
        {/* Page Title */}
        <div style={styles.headerRow}>
          <h1 style={styles.title}>Document OCR Decoders & Encoders</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Powered by Xenithra Local ML Engine
          </div>
        </div>

        {/* Top Stats widget */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Scanned Documents</span>
            <span style={styles.statVal}>{totalScans}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Average Read Confidence</span>
            <span
              style={{
                ...styles.statVal,
                color: parseFloat(avgConfidence) > 95 ? '#00ffaa' : '#ffca28'
              }}
            >
              {avgConfidence}%
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Latest Scanned Document</span>
            <span style={styles.statValText}>{latestDoc}</span>
          </div>
        </div>

        {/* Main Columns Container */}
        <div style={styles.mainColumns}>
          {/* Left Column: File Scanner & Document Preview */}
          <div style={styles.leftColumn}>
            <div style={styles.panelHeader}>
              <span>📁 Document Scanner Control</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value)}
                  style={styles.select}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Auto-Detect">Auto-Detect</option>
                </select>

                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  style={styles.select}
                >
                  <option value="Base64">Base64</option>
                  <option value="JSON">JSON</option>
                  <option value="HEX">HEX</option>
                  <option value="ROT13">ROT13</option>
                  <option value="XML">XML</option>
                </select>
              </div>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              style={{
                ...styles.dropZone,
                borderColor: isScanning ? '#00ffaa' : 'rgba(255,255,255,0.1)'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files && handleFileScan(e.target.files[0])}
                style={{ display: 'none' }}
              />

              {!docFile && !isScanning && (
                <div style={styles.dropZoneContent}>
                  <i
                    className="bx bx-cloud-upload"
                    style={{ fontSize: '48px', color: 'var(--accent-color)' }}
                  ></i>
                  <span style={{ fontWeight: 'bold' }}>Drag & Drop Document File Here</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, JPEG, and PDF documents
                  </span>
                  <button style={styles.browseBtn}>Browse Local Files</button>
                </div>
              )}

              {(docFile || isScanning) && (
                <div style={styles.previewContainer}>
                  {/* File preview or mock layout */}
                  {docFile?.previewUrl ? (
                    <img src={docFile.previewUrl} alt="Preview" style={styles.previewImg} />
                  ) : (
                    <div style={styles.placeholderDoc}>
                      <i className="bx bx-file" style={{ fontSize: '64px', color: '#ffb86c' }}></i>
                      <span>{docFile?.name || 'Reading File'}</span>
                      <span style={{ fontSize: '11px' }}>
                        {((docFile?.size || 0) / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}

                  {/* Laser Scan animation line */}
                  {isScanning && (
                    <div style={{ ...styles.scannerLaser, top: `${scanProgress}%` }} />
                  )}

                  {/* Dynamic OCR Bounding Boxes */}
                  {!isScanning && blocks.length > 0 && (
                    <div style={styles.boxesOverlay}>
                      {blocks.map((b, idx) => (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredBlock(b)}
                          onMouseLeave={() => setHoveredBlock(null)}
                          style={{
                            position: 'absolute',
                            left: `${b.x}px`,
                            top: `${b.y}px`,
                            width: `${b.w}px`,
                            height: `${b.h}px`,
                            border:
                              hoveredBlock === b
                                ? '1.5px solid #00ffaa'
                                : '1px dashed rgba(0, 255, 170, 0.4)',
                            background:
                              hoveredBlock === b
                                ? 'rgba(0, 255, 170, 0.08)'
                                : 'rgba(0, 255, 170, 0.02)',
                            cursor: 'help',
                            transition: 'all 0.15s ease'
                          }}
                          title={`Text: "${b.text}" | Confidence: ${b.confidence}%`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Laser scan loading bar */}
                  {isScanning && (
                    <div style={styles.scanningLabel}>
                      <span>Scanning Document Layout... ({scanProgress}%)</span>
                      <div style={styles.progressBarBg}>
                        <div style={{ ...styles.progressBarVal, width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bounding box hover status bar */}
            {hoveredBlock && (
              <div style={styles.hoverStatusBar}>
                <span style={{ color: '#00ffaa' }}>[BOX DETECTED]</span> "{hoveredBlock.text}"
                <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
                  Confidence: {hoveredBlock.confidence}%
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Output text editors */}
          <div style={styles.rightColumn}>
            <div style={styles.panelTabs}>
              <button
                onClick={() => setActiveTab('decoded')}
                style={{
                  ...styles.tabBtn,
                  borderBottomColor:
                    activeTab === 'decoded' ? 'var(--accent-color)' : 'transparent',
                  color: activeTab === 'decoded' ? 'var(--accent-color)' : 'var(--text-muted)'
                }}
              >
                📝 Raw Decoded Text
              </button>
              <button
                onClick={() => setActiveTab('encoded')}
                style={{
                  ...styles.tabBtn,
                  borderBottomColor:
                    activeTab === 'encoded' ? 'var(--accent-color)' : 'transparent',
                  color: activeTab === 'encoded' ? 'var(--accent-color)' : 'var(--text-muted)'
                }}
              >
                🔐 Encoded Output ({targetFormat})
              </button>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                {decodedText && (
                  <>
                    <button
                      onClick={handleCopyText}
                      style={styles.tabActionBtn}
                      title="Copy Clipboard"
                    >
                      <i className="bx bx-copy"></i> Copy
                    </button>
                    <button
                      onClick={handleDownloadText}
                      style={styles.tabActionBtn}
                      title="Download Export"
                    >
                      <i className="bx bx-download"></i> Download
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={styles.editorBox}>
              {activeTab === 'decoded' ? (
                <textarea
                  value={decodedText}
                  onChange={(e) => setDecodedText(e.target.value)}
                  placeholder="Scanned OCR text will appear here. Drag/drop a file or click browse to scan..."
                  style={styles.textArea}
                />
              ) : (
                <textarea
                  readOnly
                  value={encodedText}
                  placeholder="Encoded output will appear here automatically based on format selection..."
                  style={{ ...styles.textArea, color: '#00ffaa', fontFamily: 'monospace' }}
                />
              )}
            </div>

            {/* Document details footer */}
            {docFile && (
              <div style={styles.editorFooter}>
                <span>
                  Document: <strong>{docFile.name}</strong>
                </span>
                <span>
                  Language: <strong>{language}</strong>
                </span>
                <span>
                  Confidence:{' '}
                  <strong style={{ color: confidence > 95 ? '#00ffaa' : '#ffca28' }}>
                    {confidence}%
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Scanned History database */}
        <div style={styles.historySection}>
          <div style={styles.sectionTitle}>Document Registry Scans History</div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>File Size</th>
                  <th>Language</th>
                  <th>Encoding</th>
                  <th>Confidence</th>
                  <th>Scanned Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic'
                      }}
                    >
                      No scanned documents registered in database.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr
                      key={item.id || item._id}
                      onClick={() => handleHistoryLoad(item)}
                      style={styles.tableRow}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="bx bx-file" style={{ color: '#58a6ff' }}></i>
                          <strong>{item.filename}</strong>
                        </div>
                      </td>
                      <td>{(item.fileSize / 1024).toFixed(1)} KB</td>
                      <td>{item.language}</td>
                      <td>
                        <span style={styles.formatBadge}>{item.encodingFormat}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: item.confidence > 95 ? '#00ffaa' : '#ffca28',
                            fontWeight: 'bold'
                          }}
                        >
                          {item.confidence}%
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleHistoryDelete(item.id || item._id, e)}
                          style={styles.rowDeleteBtn}
                        >
                          ✕ Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px',
    overflowY: 'auto',
    background: 'transparent',
    fontFamily: "'Inter', sans-serif"
  },
  dashboard: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '0.04em',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  statCard: {
    background: 'rgba(10, 15, 30, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '16px',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statVal: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#fff'
  },
  statValText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  mainColumns: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  leftColumn: {
    flex: 1.1,
    minWidth: '320px',
    background: 'rgba(10, 15, 30, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  rightColumn: {
    flex: 1.3,
    minWidth: '320px',
    background: 'rgba(10, 15, 30, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#fff'
  },
  select: {
    background: 'rgba(5, 8, 22, 0.55)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#fff',
    padding: '4px 8px',
    fontSize: '11px',
    outline: 'none',
    cursor: 'pointer'
  },
  dropZone: {
    flex: 1,
    height: '280px',
    border: '2px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.25s ease'
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
    padding: '20px'
  },
  browseBtn: {
    marginTop: '6px',
    padding: '6px 16px',
    background: 'rgba(88, 166, 255, 0.15)',
    border: '1px solid rgba(88, 166, 255, 0.3)',
    borderRadius: '6px',
    color: '#58a6ff',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  previewImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    opacity: 0.8
  },
  placeholderDoc: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#fff'
  },
  scannerLaser: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, transparent 0%, #00ffaa 50%, transparent 100%)',
    boxShadow: '0 0 10px #00ffaa',
    zIndex: 10,
    pointerEvents: 'none',
    transition: 'top 0.1s linear'
  },
  boxesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
    zIndex: 5
  },
  scanningLabel: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '10px',
    color: '#00ffaa',
    zIndex: 15
  },
  progressBarBg: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressBarVal: {
    height: '100%',
    background: '#00ffaa',
    boxShadow: '0 0 8px #00ffaa',
    transition: 'width 0.1s linear'
  },
  hoverStatusBar: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#fff',
    display: 'flex',
    gap: '6px'
  },
  panelTabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '2px',
    gap: '12px'
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '6px 4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s'
  },
  tabActionBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: '#eee',
    padding: '3px 8px',
    fontSize: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  editorBox: {
    flex: 1,
    minHeight: '220px',
    display: 'flex'
  },
  textArea: {
    width: '100%',
    flex: 1,
    background: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '12px',
    color: '#e6edf3',
    fontSize: '13px',
    lineHeight: '1.5',
    outline: 'none',
    resize: 'none',
    height: '100%'
  },
  editorFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  historySection: {
    background: 'rgba(10, 15, 30, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '8px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    textAlign: 'left'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    height: '36px',
    cursor: 'pointer',
    transition: 'background 0.15s ease'
  },
  formatBadge: {
    background: 'rgba(88, 166, 255, 0.12)',
    color: '#58a6ff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: 'bold'
  },
  rowDeleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '4px 8px'
  }
}

// Add CSS effect to document registry rows
if (typeof document !== 'undefined') {
  const css = `
    tr:hover {
      background: rgba(255,255,255,0.02);
    }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

export default OcrPage
