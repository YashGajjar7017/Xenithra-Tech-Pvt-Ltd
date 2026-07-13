import { app, shell, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createRequire } from 'module'
import { start } from './api.js'

const icon = join(__dirname, '../../renderer/public/Images/github.jpg')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1170,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Simple application menu with File -> Open and View -> Toggle Theme
  try {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Open...',
            accelerator: 'Ctrl+O',
            click: async () => {
              const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile', 'multiSelections']
              })
              if (!canceled && filePaths && filePaths.length) {
                mainWindow.webContents.send('open-files', filePaths)
              }
            }
          },
          { role: 'close' }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Theme',
            accelerator: 'Ctrl+T',
            click: () => mainWindow.webContents.send('toggle-theme')
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'toggledevtools' }
        ]
      },
      { role: 'help', submenu: [{ label: 'Learn More', click: () => shell.openExternal('https://electronjs.org') }] }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  } catch (err) {
    console.warn('Could not set application menu:', err.message)
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    const args = process.argv
    const filePathArg = args.find(arg => {
      return arg && !arg.startsWith('--') && !arg.includes('node_modules') && !arg.includes('electron') &&
        (arg.endsWith('.js') || arg.endsWith('.html') || arg.endsWith('.css') || arg.endsWith('.py') || arg.endsWith('.c') || arg.endsWith('.cpp') || arg.endsWith('.cs') || arg.endsWith('.dart') || arg.endsWith('.json') || arg.endsWith('.md'))
    })

    if (filePathArg) {
      const fs = require('fs')
      const path = require('path')
      try {
        if (fs.existsSync(filePathArg)) {
          const content = fs.readFileSync(filePathArg, 'utf-8')
          mainWindow.webContents.send('open-files', [
            { path: filePathArg, content, name: path.basename(filePathArg) }
          ])
        }
      } catch (err) {
        console.error('Failed to load command line file:', err.message)
      }
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Disable autofill to prevent DevTools errors
  app.commandLine.appendSwitch('disable-features', 'Autofill')

// IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // File open dialog IPC
  ipcMain.handle('dialog:openFile', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Code Files', extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'cpp', 'c', 'java', 'html', 'css', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (canceled || !filePaths.length) return null
    
    const filePath = filePaths[0]
    try {
      const fs = require('fs').promises
      const content = await fs.readFile(filePath, 'utf-8')
      return { path: filePath, content, name: require('path').basename(filePath) }
    } catch (err) {
      console.error('File read error:', err)
      return null
    }
  })

  // File save dialog IPC
  ipcMain.handle('dialog:saveFile', async (_event, content, defaultName) => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Code File',
      defaultPath: defaultName || 'untitled.js',
      filters: [
        { name: 'Code Files', extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'cpp', 'c', 'java', 'html', 'css', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (canceled || !filePath) return null
    
    try {
      const fs = require('fs').promises
      await fs.writeFile(filePath, content, 'utf-8')
      return { path: filePath, name: require('path').basename(filePath) }
    } catch (err) {
      console.error('File write error:', err)
      return null
    }
  })

  // Direct file save IPC
  ipcMain.handle('file:save', async (_event, filePath, content) => {
    try {
      const fs = require('fs').promises
      await fs.writeFile(filePath, content, 'utf-8')
      return true
    } catch (err) {
      console.error('File write error:', err)
      return false
    }
  })

  // Read file from path IPC
  ipcMain.handle('file:read', async (_event, filePath) => {
    try {
      const fs = require('fs').promises
      return await fs.readFile(filePath, 'utf-8')
    } catch (err) {
      console.error('File read error:', err)
      return null
    }
  })

  // Close window IPC
  ipcMain.handle('close-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.close()
    }
  })

  // Open directory dialog IPC
  ipcMain.handle('dialog:openDirectory', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (canceled || !filePaths.length) return null
    return await readDirTree(filePaths[0])
  })

  // Direct directory tree read IPC
  ipcMain.handle('file:readDirectory', async (_event, dirPath) => {
    return await readDirTree(dirPath)
  })

  ipcMain.handle('get-api-port', () => process.env.API_PORT || 8000)

  // Start local API server and await binding to prevent race conditions
  try {
    if (typeof start === 'function') {
      start(process.env.API_PORT || 8000)
        .then(() => {
          createWindow()
        })
        .catch((err) => {
          console.error('[main] API server start failed:', err)
          createWindow()
        })
    } else {
      createWindow()
    }
  } catch (err) {
    console.warn('Could not start local API server:', err.message)
    createWindow()
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

async function readDirTree(dirPath) {
  const fs = require('fs').promises
  const path = require('path')
  
  const buildTree = async (currentPath) => {
    const name = path.basename(currentPath)
    let stat
    try {
      stat = await fs.stat(currentPath)
    } catch (e) {
      return null
    }
    const key = currentPath
    
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.git' || name === 'dist' || name === 'out') {
        return null
      }
      let files
      try {
        files = await fs.readdir(currentPath)
      } catch (e) {
        return null
      }
      const children = []
      for (const file of files) {
        const childNode = await buildTree(path.join(currentPath, file))
        if (childNode) children.push(childNode)
      }
      children.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1
        if (!a.isDir && b.isDir) return 1
        return a.name.localeCompare(b.name)
      })
      return { name, isDir: true, key, children }
    } else {
      let content = ''
      const ext = path.extname(currentPath).toLowerCase()
      const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.c', '.cpp', '.cs', '.dart', '.html', '.css', '.json', '.md', '.txt']
      if (textExtensions.includes(ext)) {
        try {
          content = await fs.readFile(currentPath, 'utf-8')
        } catch (e) {}
      }
      return { name, isDir: false, key, content }
    }
  }

  try {
    const tree = await buildTree(dirPath)
    return { tree, path: dirPath, name: path.basename(dirPath) }
  } catch (err) {
    console.error('Directory read error:', err)
    return null
  }
}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})