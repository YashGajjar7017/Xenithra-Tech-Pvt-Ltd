import React from 'react';

const Editor = () => {
  return (
    <>
      {/* Editor header */}
      <div className="editor-header">
        <div className="editor-controls">
          <button className="btn-run" id="runBtn">▶ Run</button>
          <button>🐞 Debug</button>
          <button>■ Stop</button>
          <button>Share</button>
          <button>Save</button>
          <button>{`{ }`} Format</button>
          <button>Print</button>
          <button>Timer</button>
          <button>Github Account</button>
        </div>
      </div>

      {/* Editor + terminal */}
      <div className="editor-wrapper">
        <div className="editor" id="editor">
          <div className="line-numbers" id="lineNumbers">
            1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10<br />11<br />12<br />13<br />14<br />15<br />16
          </div>
          {/* Editable code area */}
          <div className="code-area" id="codeArea" contentEditable spellCheck>
            {`/******************************************************************************
NovaGlass Code Studio. Futuristic glassmorphism IDE with neon gradients. Type here,
press enter, and enjoy the glow.
*******************************************************************************/
#include <stdio.h> int main(void) { printf("Hello, NovaGlass!\\n"); return 0; }`}
          </div>
        </div>

        {/* Terminal */}
        <div className="terminal" id="terminal">
          <div className="terminal-header">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
            <span>integrated terminal • demo API</span>
          </div>
          <div className="terminal-body" id="terminalBody">
            <div className="terminal-line">
              <span className="prompt">nova@glass</span>:<span className="muted">~</span>$ run main.c
            </div>
            <div className="terminal-line">
              <span className="muted">Waiting for first run...</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;
