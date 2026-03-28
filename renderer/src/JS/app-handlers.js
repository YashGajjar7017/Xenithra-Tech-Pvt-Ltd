/**
 * App Handlers Module
 * Central location for all app button and menu handlers
 */

// ============================================
// Button Action Handlers
// ============================================

/**
 * File Menu Handlers
 */
export const fileMenuHandlers = {
  new: () => {
    console.log('File: Creating new file');
    // TODO: Implement
  },
  open: () => {
    console.log('File: Opening file');
    // Trigger file dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      console.log('File selected:', file.name);
    };
    input.click();
  },
  save: () => {
    console.log('File: Saving file');
    // Submit save event
    document.dispatchEvent(new Event('save-file'));
  },
  saveAs: () => {
    console.log('File: Save As');
    // Implement save as dialog
  },
  exit: () => {
    console.log('File: Exit');
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke('close-window');
    } else {
      window.close();
    }
  }
};

/**
 * Edit Menu Handlers
 */
export const editMenuHandlers = {
  undo: () => {
    console.log('Edit: Undo');
    document.execCommand('undo');
  },
  redo: () => {
    console.log('Edit: Redo');
    document.execCommand('redo');
  },
  cut: () => {
    console.log('Edit: Cut');
    document.execCommand('cut');
  },
  copy: () => {
    console.log('Edit: Copy');
    document.execCommand('copy');
  },
  paste: () => {
    console.log('Edit: Paste');
    document.execCommand('paste');
  },
  selectAll: () => {
    console.log('Edit: Select All');
    document.execCommand('selectAll');
  },
  delete: () => {
    console.log('Edit: Delete');
    document.execCommand('delete');
  }
};

/**
 * View Menu Handlers
 */
export const viewMenuHandlers = {
  zoomIn: () => {
    console.log('View: Zoom In');
    const currentZoom = localStorage.getItem('zoomLevel') || 100;
    const newZoom = Math.min(200, parseInt(currentZoom) + 10);
    localStorage.setItem('zoomLevel', newZoom);
    document.documentElement.style.zoom = (newZoom / 100);
  },
  zoomOut: () => {
    console.log('View: Zoom Out');
    const currentZoom = localStorage.getItem('zoomLevel') || 100;
    const newZoom = Math.max(50, parseInt(currentZoom) - 10);
    localStorage.setItem('zoomLevel', newZoom);
    document.documentElement.style.zoom = (newZoom / 100);
  },
  resetZoom: () => {
    console.log('View: Reset Zoom');
    localStorage.setItem('zoomLevel', 100);
    document.documentElement.style.zoom = 1;
  },
  toggleSidebar: () => {
    console.log('View: Toggle Sidebar');
    document.dispatchEvent(new Event('toggle-sidebar'));
  },
  toggleFullscreen: () => {
    console.log('View: Toggle Fullscreen');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }
};

/**
 * Help Menu Handlers
 */
export const helpMenuHandlers = {
  about: () => {
    console.log('Help: About');
    alert('Xenithra Technologies - Modern IDE\nVersion 1.0.0\n© 2024 Xenithra Tech Pvt Ltd\n\nA frosted neon playground for modern coding.');
  },
  documentation: () => {
    console.log('Help: Documentation');
    window.open('https://docs.xenithra.tech', '_blank');
  },
  shortcuts: () => {
    console.log('Help: Keyboard Shortcuts');
    const shortcuts = `
Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━
File:
  Ctrl+N     New File
  Ctrl+O     Open File
  Ctrl+S     Save
  Ctrl+Shift+S  Save As
  Ctrl+Q     Exit

Edit:
  Ctrl+Z     Undo
  Ctrl+Y     Redo
  Ctrl+X     Cut
  Ctrl+C     Copy
  Ctrl+V     Paste
  Ctrl+A     Select All

View:
  Ctrl+=     Zoom In
  Ctrl+-     Zoom Out
  Ctrl+0     Reset Zoom
  F11        Fullscreen

Help:
  F1         Show Help
  Ctrl+H     Show Shortcuts
    `;
    alert(shortcuts);
  },
  feedback: () => {
    console.log('Help: Send Feedback');
    window.open('https://feedback.xenithra.tech', '_blank');
  }
};

/**
 * Sidebar Navigation Handlers
 */
export const sidebarHandlers = {
  openFolder: async () => {
    console.log('Sidebar: Open Folder');
    if (window.ipcRenderer) {
      try {
        const result = await window.ipcRenderer.invoke('open-folder-dialog');
        if (result && !result.cancelled) {
          console.log('Folder opened:', result.filePaths[0]);
          return result.filePaths[0];
        }
      } catch (error) {
        console.error('Error opening folder:', error);
      }
    } else {
      console.log('IPC not available, using fallback');
    }
  },
  goToDashboard: () => {
    console.log('Sidebar: Navigate to Dashboard');
    window.location.href = '/#/Dashboard';
  },
  openSettings: () => {
    console.log('Sidebar: Open Settings');
    window.location.href = '/#/Settings';
  },
  openTerminal: () => {
    console.log('Sidebar: Open Terminal');
    document.dispatchEvent(new Event('open-terminal'));
  },
  openExtensions: () => {
    console.log('Sidebar: Open Extensions');
    window.location.href = '/#/Extensions';
  }
};

/**
 * Workspace Button Handlers
 */
export const workspaceHandlers = {
  dashboard: () => {
    console.log('Workspace: Dashboard');
    window.location.href = '/#/Dashboard';
  },
  projects: () => {
    console.log('Workspace: Projects');
    window.location.href = '/#/Projects';
  },
  snippets: () => {
    console.log('Workspace: Snippets');
    window.location.href = '/#/Snippets';
  },
  playground: () => {
    console.log('Workspace: Playground');
    window.location.href = '/#/Playground';
  },
  classroom: () => {
    console.log('Workspace: Classroom');
    window.location.href = '/#/Classroom';
  }
};

/**
 * Settings Handlers
 */
export const settingsHandlers = {
  saveUserSettings: (settings) => {
    console.log('Saving user settings:', settings);
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // Dispatch event for components to listen
    document.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }));
  },
  loadUserSettings: () => {
    const settings = localStorage.getItem('userSettings');
    return settings ? JSON.parse(settings) : {};
  },
  resetSettings: () => {
    console.log('Resetting settings to default');
    localStorage.removeItem('userSettings');
    document.documentElement.style.zoom = 1;
    localStorage.removeItem('zoomLevel');
  },
  toggleTheme: () => {
    console.log('Toggling theme');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return newTheme;
  }
};

/**
 * Setup all event listeners
 */
export const setupEventListeners = () => {
  // File handlers
  document.addEventListener('DOMContentLoaded', () => {
    console.log('App handlers initialized');
    
    // Restore zoom level
    const savedZoom = localStorage.getItem('zoomLevel') || 100;
    document.documentElement.style.zoom = (savedZoom / 100);
    
    // Restore theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  });
};

/**
 * Global keyboard shortcuts
 */
export const setupKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Ctrl+N - New File
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      fileMenuHandlers.new();
    }
    // Ctrl+O - Open File
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      fileMenuHandlers.open();
    }
    // Ctrl+S - Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      fileMenuHandlers.save();
    }
    // Ctrl+Q - Exit
    if (e.ctrlKey && e.key === 'q') {
      e.preventDefault();
      fileMenuHandlers.exit();
    }
    // Ctrl+= - Zoom In
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      viewMenuHandlers.zoomIn();
    }
    // Ctrl+- - Zoom Out
    if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      viewMenuHandlers.zoomOut();
    }
    // Ctrl+0 - Reset Zoom
    if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      viewMenuHandlers.resetZoom();
    }
    // F1 - Help
    if (e.key === 'F1') {
      e.preventDefault();
      helpMenuHandlers.shortcuts();
    }
  });
};

// Initialize on load
if (typeof window !== 'undefined') {
  setupEventListeners();
  setupKeyboardShortcuts();
}

export default {
  fileMenuHandlers,
  editMenuHandlers,
  viewMenuHandlers,
  helpMenuHandlers,
  sidebarHandlers,
  workspaceHandlers,
  settingsHandlers,
  setupEventListeners,
  setupKeyboardShortcuts
};
