import React from 'react';

const Terminal = () => {
  return (
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
  );
};

export default Terminal;
