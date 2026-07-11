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

  ipcMain.handle('get-api-port', () => process.env.API_PORT || 8000)

  // Start local API server
  try {
    if (typeof start === 'function') {
      start(process.env.API_PORT || 8000)
    }
  } catch (err) {
    console.warn('Could not start local API server:', err.message)
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})