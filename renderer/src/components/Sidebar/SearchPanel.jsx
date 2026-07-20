import React, { useState } from 'react'

const SearchPanel = () => {
  const [query, setQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [matchWholeWord, setMatchWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [includesPattern, setIncludesPattern] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    const activePath = localStorage.getItem('activeWorkspacePath') || ''
    if (window.api && typeof window.api.searchWorkspace === 'function') {
      try {
        const res = await window.api.searchWorkspace(activePath, query, {
          caseSensitive,
          matchWholeWord,
          useRegex,
          includesPattern
        })
        setSearchResults(res)
      } catch (err) {
        setSearchResults({ error: err.message, results: [] })
      }
    }
    setIsSearching(false)
  }

  const handleLineClick = async (filePath, lineNumber) => {
    let content = ''
    if (window.api && typeof window.api.readFile === 'function') {
      content = await window.api.readFile(filePath)
    }
    const fileName = filePath.split(/[\\/]/).pop()
    window.dispatchEvent(new CustomEvent('open-file', {
      detail: {
        filename: fileName,
        code: content || '',
        path: filePath,
        jumpLine: lineNumber
      }
    }))
  }

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--sidebar-bg)',
        color: 'var(--text-main)',
        fontSize: '12px',
        padding: '12px',
        overflowY: 'auto'
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>
        SEARCH WORKSPACE
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        In: {localStorage.getItem('activeWorkspacePath') || 'Current Root Folder'}
      </div>

      {/* Primary Search Input with Options */}
      <div style={{ marginBottom: '10px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search all files..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              padding: '6px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{
              background: '#00ffaa',
              border: 'none',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '4px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Search
          </button>
        </div>

        {/* Options Toggles */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          <button 
            onClick={() => setCaseSensitive(!caseSensitive)}
            style={{
              background: caseSensitive ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255,255,255,0.04)',
              border: caseSensitive ? '1px solid #00ffaa' : '1px solid rgba(255,255,255,0.1)',
              color: caseSensitive ? '#00ffaa' : '#8b949e',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Match Case"
          >
            Aa
          </button>

          <button 
            onClick={() => setMatchWholeWord(!matchWholeWord)}
            style={{
              background: matchWholeWord ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255,255,255,0.04)',
              border: matchWholeWord ? '1px solid #00ffaa' : '1px solid rgba(255,255,255,0.1)',
              color: matchWholeWord ? '#00ffaa' : '#8b949e',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Match Whole Word"
          >
            "W"
          </button>

          <button 
            onClick={() => setUseRegex(!useRegex)}
            style={{
              background: useRegex ? 'rgba(0, 255, 170, 0.2)' : 'rgba(255,255,255,0.04)',
              border: useRegex ? '1px solid #00ffaa' : '1px solid rgba(255,255,255,0.1)',
              color: useRegex ? '#00ffaa' : '#8b949e',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Use Regular Expression"
          >
            .*
          </button>

          <input 
            type="text" 
            placeholder="files to include (e.g. *.js)" 
            value={includesPattern} 
            onChange={(e) => setIncludesPattern(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ccc',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '3px'
            }}
          />
        </div>
      </div>

      {/* Results Header / Loading */}
      {isSearching && (
        <div style={{ color: '#58a6ff', fontSize: '11px', padding: '8px 0' }}>Searching workspace files...</div>
      )}

      {searchResults && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '8px' }}>
            Found {searchResults.totalMatches || 0} results across {searchResults.results ? searchResults.results.length : 0} files.
          </div>

          {searchResults.results && searchResults.results.map((fileRes, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              {/* File title header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#58a6ff', fontWeight: 'bold', fontSize: '11px', padding: '2px 0' }}>
                <i className="bx bx-file"></i>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileRes.relativePath}</span>
                <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px', color: '#8b949e', marginLeft: 'auto' }}>
                  {fileRes.matchesCount}
                </span>
              </div>

              {/* Matching lines */}
              {fileRes.matches.map((m, mIdx) => (
                <div 
                  key={mIdx}
                  onClick={() => handleLineClick(fileRes.path, m.lineNumber)}
                  style={{
                    padding: '3px 8px',
                    marginLeft: '12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    display: 'flex',
                    gap: '8px',
                    fontFamily: 'monospace',
                    color: '#c9d1d9'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#8b949e', minWidth: '24px' }}>Line {m.lineNumber}:</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.lineContent}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchPanel
