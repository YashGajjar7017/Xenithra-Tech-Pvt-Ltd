import React from 'react';
// import './css/NovaGlass.css';
import './css/Beta_Index.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import Bottom from './components/Bottom';

const BetaIndex = () => {
  return (
    <div className="app">
      <div className="border-neon"></div>
      <div className="shell">
        <Sidebar />
        <div className="main">
          <Topbar />
          <Editor />
          <Bottom />
          <Terminal />
        </div>
      </div>
    </div>
  );
};

export default BetaIndex;
