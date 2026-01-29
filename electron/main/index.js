import { app, shell, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const icon = join(__dirname, '../../renderer/public/Images/github.jpg')
import { createRequire } from 'module'

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

  // Start local API server (if available)
  try {
    const requireMain = createRequire(import.meta.url)
    const api = requireMain/('../../electron/main/api.js')
    if (api && typeof api.start === 'function') {
      // Default to 8000 to match expected port; can be overridden with API_PORT env var
      api.start(process.env.API_PORT || 8000)
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