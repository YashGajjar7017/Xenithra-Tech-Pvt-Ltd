import React from 'react';

const Editor = () => {
  return (
    <div className="editor-wrapper" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      background: 'rgba(10, 16, 32, 0.45)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--panel-border)',
      borderRadius: '8px'
    }}>
      {/* Editor header */}
      <div className="editor-header" style={{
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        background: 'rgba(5, 8, 22, 0.5)',
        borderBottom: '1px solid var(--panel-border)'
      }}>
        <div className="editor-controls" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-run" id="runBtn" style={{
            background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '2px 8px',
            cursor: 'pointer'
          }}>▶ Run</button>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#00e5ff', borderRadius: '4px', fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}>🐞 Debug</button>
          <button style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.25)', color: '#ff6b6b', borderRadius: '4px', fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}>■ Stop</button>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', borderRadius: '4px', fontSize: '11px', padding: '2px 8px', cursor: 'pointer' }}>Save</button>
        </div>
      </div>

      {/* Editor workspace */}
      <div className="editor" id="editor" style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div className="line-numbers" id="lineNumbers" style={{
          background: 'rgba(0, 0, 0, 0.15)',
          borderRight: '1px solid var(--panel-border)',
          textAlign: 'right',
          color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          fontSize: '13px',
          lineHeight: '1.5',
          padding: '10px 8px',
          width: '45px',
          userSelect: 'none'
        }}>
          1<br />2<br />3<br />4<br />5<br />6<br />7<br />8
        </div>
        {/* Editable code area */}
        <textarea className="code-area" id="codeArea" defaultValue={`#include <stdio.h>\n\nint main(void) {\n    printf("Hello, NovaGlass!\\n");\n    return 0;\n}`} style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-main)',
          padding: '10px 14px',
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          fontSize: '13px',
          lineHeight: '1.5',
          resize: 'none',
          height: '100%',
          overflowY: 'auto'
        }} />
      </div>

      {/* Integrated Terminal */}
      <div className="terminal" id="terminal" style={{
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid var(--panel-border)',
        background: 'var(--terminal-bg)'
      }}>
        <div className="terminal-header" style={{
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          background: 'rgba(0, 0, 0, 0.2)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          gap: '6px'
        }}>
          <div className="dot red" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div className="dot yellow" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div className="dot green" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }}></div>
          <span style={{ marginLeft: '6px' }}>integrated terminal • demo API</span>
        </div>
        <div className="terminal-body" id="terminalBody" style={{
          flex: 1,
          padding: '8px 12px',
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          fontSize: '12px',
          color: 'var(--terminal-text)'
        }}>
          <div className="terminal-line">
            <span className="prompt" style={{ color: 'var(--accent-color)' }}>nova@glass</span>:<span className="muted" style={{ opacity: 0.5 }}>~</span>$ run main.c
          </div>
          <div className="terminal-line" style={{ opacity: 0.5 }}>
            <span>Waiting for first run...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
