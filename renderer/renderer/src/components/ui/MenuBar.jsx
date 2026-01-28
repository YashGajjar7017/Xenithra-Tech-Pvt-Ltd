import React from 'react';

const MenuBar = () => {
  return (
    <div className="menu-bar">
      <button className="sidenav-toggle-btn" title="Toggle Sidebar" id="sidebarToggle">☰</button>
      <div className="menu-item" id="fileMenu">File</div>
      <div className="menu-item" id="editMenu">Edit</div>
      <div className="menu-item" id="selectionMenu">Selection</div>
      <div className="menu-item" id="viewMenu">View</div>
      <div className="menu-item" id="helpMenu">Help</div>
      <div className="workspace-buttons">
        <button data-page="dashboard" title="Dashboard">📊 Dashboard</button>
        <button data-page="projects" title="Projects">📁 Projects</button>
        <button data-page="snippets" title="Snippets">📝 Snippets</button>
        <button data-page="playground" title="Playground">🎮 Playground</button>
        <button data-page="Classroom" title="Classroom">🏫 Classroom</button>
      </div>
      <div className="menu-spacer"></div>
      <div className="menu-panel">
        <div className="lang-select">
          <span>Language:</span>
          <div className="dropdown" id="langDropdown">
            <button className="dropdown-toggle" type="button">
              <span id="langLabel">Select</span>
              <span className="arrow">▾</span>
            </button>
            <div className="dropdown-menu">
              <button data-lang="c">C (GCC)</button>
              <button data-lang="cpp">C++ (G++)</button>
              <button data-lang="python">Python 3</button>
              <button data-lang="js">Node.js</button>
              <button data-lang="xml">XML</button>
              <button data-lang=".net">Dot Net</button>
              <button data-lang="dart">Dart</button>
              <button data-lang="nextjs">Next.js</button>
            </div>
          </div>
        </div>
        <div className="auth-section" id="authSection">
          <button className="btn-login" id="loginBtn">Login</button>
          <button className="btn-signup" id="signupBtn">Signup</button>
        </div>
        <div className="user-display" id="userDisplay" style={{display: 'none'}}>
          <div className="user-logo">👤</div>
          <span className="user-name" id="displayUsername">User</span>
        </div>
        <div className="account-circle" id="accountCircle" title="Account">👤</div>
      </div>
    </div>
  );
};

export default MenuBar;
