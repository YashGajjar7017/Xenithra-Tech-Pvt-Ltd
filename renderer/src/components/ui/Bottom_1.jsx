import React from 'react';

const Bottom = () => {
  return (
    <div className="bottom">
      <div>
        <label>Command line arguments:</label>
        <input type="text" id="cliArgs" placeholder="--help" />
      </div>
      <div className="stdin-options">
        Standard Input:
        <label><input type="radio" name="stdin" defaultChecked /> Interactive Console</label>
        <label><input type="radio" name="stdin" /> Text</label>
      </div>
    </div>
  );
};

export default Bottom;
