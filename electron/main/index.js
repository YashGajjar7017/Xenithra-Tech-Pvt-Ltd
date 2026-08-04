import { app, shell, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import path, { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createRequire } from 'module'
import { start } from './api.js'
import {
  initTerminalSession,
  writeToTerminal,
  killTerminalSession,
  executeTerminalCommand
} from './Services/terminal.service.js'
import {
  startLiveServer,
  stopLiveServer,
  getLiveServerStatus
} from './Services/liveServer.service.js'
import {
  getGitInfo,
  cloneGitRepo,
  commitGitChanges,
  pushGitChanges,
  pullGitChanges,
  getGitFileDiff
} from './Services/git.service.js'
import { searchWorkspace } from './Services/search.service.js'
import {
  predictInlineCompletion,
  generateLocalAIChatResponse,
  trainLocalMLModel,
  startModelTraining
} from './Services/localML.service.js'
import {
  startTcpServer,
  getTcpClients,
  pairTcpClient,
  broadcastCodeToClients,
  simulateLocalClient,
  authSimulatedClient,
  sendSimulatedClientCode,
  disconnectSimulatedClient
} from './Services/tcpServer.service.js'
import {
  getDockerContainers,
  getDockerImages,
  startDockerContainer,
  stopDockerContainer,
  restartDockerContainer,
  getDockerLogs
} from './Services/docker.service.js'
import {
  createGitHubGist,
  createRtcRoom,
  joinRtcRoom,
  syncRtcCode
} from './Services/collaboration.service.js'
import {
  getXamppStatus,
  checkSystemInstalled,
  startPhpService,
  startMysqlService,
  stopXamppService
} from './Services/xampp.service.js'
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  disconnectFirebase,
  getFirebaseUsers,
  addFirebaseUser,
  deleteFirebaseUser,
  getFirestoreCollections,
  addFirestoreDocument,
  deleteFirestoreDocument
} from './Services/firebase.service.js'

const icon = join(__dirname, '../../renderer/public/Images/app_logo.png')

const xmlFilePath = join(app.getPath('temp'), 'temp_extensions.xml')
const storeXmlFilePath = join(app.getPath('temp'), 'store_extensions.xml')

// Register custom deep link protocol: xenithra://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('xenithra', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('xenithra')
}

function handleDeepLinkUrl(url) {
  if (!url) return
  console.log('[DeepLink] Received protocol URL:', url)
  let token = ''
  // Match xenithra://token:XYZ or xenithra://token=XYZ or xenithra://?token=XYZ
  const match = url.match(/xenithra:\/\/(?:token:|\?token=|token=)?([^&\s]+)/i)
  if (match) {
    token = match[1]
  }
  const windows = BrowserWindow.getAllWindows()
  if (windows.length > 0) {
    const win = windows[0]
    if (win.isMinimized()) win.restore()
    win.focus()
    win.webContents.send('deep-link-token', { url, token })
  }
}

// Single Instance Lock for handling protocol links on Windows
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    const deepLinkUrl = commandLine.find((arg) => arg.startsWith('xenithra://'))
    if (deepLinkUrl) {
      handleDeepLinkUrl(deepLinkUrl)
    }
  })
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLinkUrl(url)
})

function parseExtensionsXml(xmlString) {
  const extensions = []
  const regex = /<extension\s+([^>]+)\s*\/>/g
  let match
  while ((match = regex.exec(xmlString)) !== null) {
    const attrsStr = match[1]
    const attrs = {}
    const attrRegex = /(\w+)="([^"]*)"/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2]
    }
    if (attrs.id) {
      extensions.push(attrs)
    }
  }
  return extensions
}

function parseStoreExtensionsXml(xmlString) {
  const extensions = []

  // 1. Check if it has tag-based format: <extension> ... </extension>
  const extBlocks = xmlString.match(/<extension[\s\S]*?>[\s\S]*?<\/extension>/gi) || []
  if (extBlocks.length > 0) {
    for (const block of extBlocks) {
      const idMatch = block.match(/<id>([\s\S]*?)<\/id>/i)
      const nameMatch = block.match(/<name>([\s\S]*?)<\/name>/i)
      const verMatch = block.match(/<version>([\s\S]*?)<\/version>/i)
      const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i)

      const startTagMatch = block.match(/<extension\s+([^>]+)>/i)
      let attrs = {}
      if (startTagMatch) {
        const attrRegex = /(\w+)="([^"]*)"/g
        let attrMatch
        while ((attrMatch = attrRegex.exec(startTagMatch[1])) !== null) {
          attrs[attrMatch[1]] = attrMatch[2]
        }
      }

      const id = idMatch ? idMatch[1].trim() : attrs.id
      const name = nameMatch ? nameMatch[1].trim() : attrs.name
      const version = verMatch ? verMatch[1].trim() : attrs.version || '1.0.0'
      const description = descMatch ? descMatch[1].trim() : attrs.description || ''

      if (id && name) {
        extensions.push({ id, name, version, description })
      }
    }
  }

  // 2. Check if we missed any self-closing tags: <extension id="..." name="..." />
  const selfClosingRegex = /<extension\s+([^>]+)\s*\/>/g
  let match
  while ((match = selfClosingRegex.exec(xmlString)) !== null) {
    const attrsStr = match[1]
    const attrs = {}
    const attrRegex = /(\w+)="([^"]*)"/g
    let attrMatch
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2]
    }
    if (attrs.id && attrs.name) {
      if (!extensions.some((e) => e.id === attrs.id)) {
        extensions.push({
          id: attrs.id,
          name: attrs.name,
          version: attrs.version || '1.0.0',
          description: attrs.description || ''
        })
      }
    }
  }

  return extensions
}

function generateExtensionsXml(extensions) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<extensions>\n'
  extensions.forEach((ext) => {
    xml += `  <extension id="${ext.id}" name="${ext.name}" version="${ext.version || '1.0.0'}" description="${ext.description || ''}" />\n`
  })
  xml += '</extensions>\n'
  return xml
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1170,
    show: false,
    autoHideMenuBar: true,
    icon: icon, // Global icon for Windows/Linux/macOS window decoration
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
            label: 'New File',
            accelerator: 'Ctrl+N',
            click: () => {
              mainWindow.webContents.send('menu-file-new')
            }
          },
          {
            label: 'Open File...',
            accelerator: 'Ctrl+O',
            click: async () => {
              const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile', 'multiSelections']
              })
              if (!canceled && filePaths && filePaths.length) {
                const filesData = await Promise.all(
                  filePaths.map(async (filePath) => {
                    try {
                      const content = await fs.promises.readFile(filePath, 'utf-8')
                      return { path: filePath, content, name: path.basename(filePath) }
                    } catch (e) {
                      return { path: filePath, content: '', name: path.basename(filePath) }
                    }
                  })
                )
                mainWindow.webContents.send('open-files', filesData)
              }
            }
          },
          {
            label: 'Open Folder...',
            accelerator: 'Ctrl+Shift+O',
            click: async () => {
              const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory']
              })
              if (!canceled && filePaths && filePaths.length) {
                const dirPath = filePaths[0]
                const result = await readDirTree(dirPath)
                mainWindow.webContents.send('open-directory', result)
              }
            }
          },
          {
            label: 'Save',
            accelerator: 'Ctrl+S',
            click: () => {
              mainWindow.webContents.send('menu-file-save')
            }
          },
          {
            label: 'Save As...',
            accelerator: 'Ctrl+Shift+S',
            click: () => {
              mainWindow.webContents.send('menu-file-saveas')
            }
          },
          { type: 'separator' },
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
      {
        role: 'help',
        submenu: [
          { label: 'Learn More', click: () => shell.openExternal('https://electronjs.org') }
        ]
      }
    ]

    Menu.setApplicationMenu(null)
    mainWindow.setMenuBarVisibility(false)
  } catch (err) {
    console.warn('Could not set application menu:', err.message)
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.maximize()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    const args = process.argv
    const deepLinkArg = args.find((arg) => arg && arg.startsWith('xenithra://'))
    if (deepLinkArg) {
      handleDeepLinkUrl(deepLinkArg)
    }

    const filePathArg = args.find((arg) => {
      return (
        arg &&
        !arg.startsWith('--') &&
        !arg.includes('node_modules') &&
        !arg.includes('electron') &&
        (arg.endsWith('.js') ||
          arg.endsWith('.html') ||
          arg.endsWith('.css') ||
          arg.endsWith('.py') ||
          arg.endsWith('.c') ||
          arg.endsWith('.cpp') ||
          arg.endsWith('.cs') ||
          arg.endsWith('.dart') ||
          arg.endsWith('.json') ||
          arg.endsWith('.md'))
      )
    })

    if (filePathArg) {
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
  ipcMain.handle('dialog:openFile', async (event) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        {
          name: 'Code Files',
          extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'cpp', 'c', 'java', 'html', 'css', 'json']
        },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (canceled || !filePaths.length) return null

    const filePath = filePaths[0]
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      return { path: filePath, content, name: path.basename(filePath) }
    } catch (err) {
      console.error('File read error:', err)
      return null
    }
  })

  // File save dialog IPC
  ipcMain.handle('dialog:saveFile', async (event, content, defaultName) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Code File',
      defaultPath: defaultName || 'untitled.js',
      filters: [
        {
          name: 'Code Files',
          extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'cpp', 'c', 'java', 'html', 'css', 'json']
        },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (canceled || !filePath) return null

    try {
      await fs.promises.writeFile(filePath, content, 'utf-8')
      return { path: filePath, name: path.basename(filePath) }
    } catch (err) {
      console.error('File write error:', err)
      return null
    }
  })

  // Direct file save IPC (saves directly to local SSD / disk path)
  ipcMain.handle('file:save', async (_event, filePath, content) => {
    if (!filePath) return false
    try {
      await fs.promises.writeFile(filePath, content, 'utf-8')
      return true
    } catch (err) {
      console.error('[file:save error]', err)
      return false
    }
  })

  // Read file from path IPC
  ipcMain.handle('file:read', async (_event, filePath) => {
    try {
      return await fs.promises.readFile(filePath, 'utf-8')
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
  ipcMain.handle('dialog:openDirectory', async (event) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender)
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

  // Extensions temporary XML handlers
  ipcMain.handle('extensions:get', async () => {
    try {
      if (!fs.existsSync(xmlFilePath)) {
        const defaultXml = '<?xml version="1.0" encoding="UTF-8"?>\n<extensions>\n</extensions>\n'
        await fs.promises.writeFile(xmlFilePath, defaultXml, 'utf-8')
        return []
      }
      const content = await fs.promises.readFile(xmlFilePath, 'utf-8')
      return parseExtensionsXml(content)
    } catch (err) {
      console.error('Error reading extensions XML:', err)
      return []
    }
  })

  ipcMain.handle('extensions:save', async (_event, extensions) => {
    try {
      const xml = generateExtensionsXml(extensions || [])
      await fs.promises.writeFile(xmlFilePath, xml, 'utf-8')
      console.log('Saved extensions to temporary XML at:', xmlFilePath)
      return true
    } catch (err) {
      console.error('Error saving extensions XML:', err)
      return false
    }
  })

  // Store Extensions XML/DB Handlers
  ipcMain.handle('extensions:getStore', async () => {
    try {
      if (!fs.existsSync(storeXmlFilePath)) {
        const defaultStoreXml =
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<extensions>\n' +
          '  <extension id="firebase-extension" name="Firebase Console Extension" version="1.0.0" description="Firebase hosting deployment, auth database viewer, and firestore client." />\n' +
          '  <extension id="github-theme" name="GitHub Theme Pack" version="1.2.0" description="Clean GitHub dark and light themes." />\n' +
          '  <extension id="python-diagnostics" name="Python Diagnostics" version="2.1.0" description="Real-time linting, formatting and troubleshooting." />\n' +
          '  <extension id="cpp-toolchain" name="C++ Compiler Suite" version="1.0.5" description="Enables C++ execution environment and flags." />\n' +
          '  <extension id="markdown-preview" name="Markdown Previewer" version="1.5.0" description="Renders Markdown documentation in side panel." />\n' +
          '  <extension id="vim-keybindings" name="Vim Keybindings" version="0.9.0" description="Vim style inputs and movements in editor." />\n' +
          '  <extension id="devtools-helper" name="DevTools Helper" version="1.1.0" description="Extra debugging utilities and log consoles." />\n' +
          '</extensions>\n'
        await fs.promises.writeFile(storeXmlFilePath, defaultStoreXml, 'utf-8')
        return parseStoreExtensionsXml(defaultStoreXml)
      }
      const content = await fs.promises.readFile(storeXmlFilePath, 'utf-8')
      return parseStoreExtensionsXml(content)
    } catch (err) {
      console.error('Error reading store extensions XML:', err)
      return []
    }
  })

  const saveStoreXml = async (extensions) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<extensions>\n'
    extensions.forEach((ext) => {
      xml += `  <extension id="${ext.id}" name="${ext.name}" version="${ext.version || '1.0.0'}" description="${ext.description || ''}" />\n`
    })
    xml += '</extensions>\n'
    await fs.promises.writeFile(storeXmlFilePath, xml, 'utf-8')
  }

  ipcMain.handle('extensions:uploadStoreXmlContent', async (_event, xmlContent) => {
    try {
      const newExts = parseStoreExtensionsXml(xmlContent)
      if (!newExts || newExts.length === 0)
        return { success: false, message: 'Invalid XML format or no extensions found.' }

      const currentContent = fs.existsSync(storeXmlFilePath)
        ? await fs.promises.readFile(storeXmlFilePath, 'utf-8')
        : '<extensions></extensions>'
      const currentExts = parseStoreExtensionsXml(currentContent)

      let addedCount = 0
      newExts.forEach((newExt) => {
        if (!currentExts.some((e) => e.id === newExt.id)) {
          currentExts.push(newExt)
          addedCount++
        }
      })

      await saveStoreXml(currentExts)
      return {
        success: true,
        message: `Successfully added ${addedCount} extension(s) to store database.`,
        extensions: currentExts
      }
    } catch (err) {
      console.error('Error uploading XML content:', err)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('extensions:uploadStore', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: 'Select Extension XML File',
      filters: [{ name: 'XML Files', extensions: ['xml'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths.length) return null
    try {
      const xmlContent = await fs.promises.readFile(filePaths[0], 'utf-8')
      const newExts = parseStoreExtensionsXml(xmlContent)
      if (!newExts || newExts.length === 0)
        return { success: false, message: 'No valid extensions found in XML.' }

      const currentContent = fs.existsSync(storeXmlFilePath)
        ? await fs.promises.readFile(storeXmlFilePath, 'utf-8')
        : '<extensions></extensions>'
      const currentExts = parseStoreExtensionsXml(currentContent)

      let addedCount = 0
      newExts.forEach((newExt) => {
        if (!currentExts.some((e) => e.id === newExt.id)) {
          currentExts.push(newExt)
          addedCount++
        }
      })

      await saveStoreXml(currentExts)
      return {
        success: true,
        message: `Added ${addedCount} extensions from ${path.basename(filePaths[0])}.`,
        extensions: currentExts
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  })

  // Firebase IPC Handlers
  ipcMain.handle('firebase:getConfig', () => getFirebaseConfig())
  ipcMain.handle('firebase:saveConfig', (_event, projectId, apiKey) =>
    saveFirebaseConfig(projectId, apiKey)
  )
  ipcMain.handle('firebase:disconnect', () => disconnectFirebase())
  ipcMain.handle('firebase:getUsers', () => getFirebaseUsers())
  ipcMain.handle('firebase:addUser', (_event, email, password) => addFirebaseUser(email, password))
  ipcMain.handle('firebase:deleteUser', (_event, uid) => deleteFirebaseUser(uid))
  ipcMain.handle('firebase:getCollections', () => getFirestoreCollections())
  ipcMain.handle('firebase:addDocument', (_event, col, docId, data) =>
    addFirestoreDocument(col, docId, data)
  )
  ipcMain.handle('firebase:deleteDocument', (_event, col, docId) =>
    deleteFirestoreDocument(col, docId)
  )
  ipcMain.handle('firebase:deploy', async (_event, projectId) => {
    // Simulate firebase hosting deploy
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, url: `https://${projectId}.web.app` })
      }, 5000)
    })
  })

  // Terminal Session IPC Handlers
  ipcMain.handle('terminal:init', async (event, cwd) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return initTerminalSession(cwd, (data) => {
      if (window && !window.isDestroyed()) {
        window.webContents.send('terminal:data', data)
      }
    })
  })

  ipcMain.handle('terminal:write', (_event, input) => writeToTerminal(input))
  ipcMain.handle('terminal:kill', () => killTerminalSession())
  ipcMain.handle('terminal:execute', (_event, cmd, cwd) => executeTerminalCommand(cmd, cwd))

  // Live Server IPC Handlers
  ipcMain.handle('liveserver:start', (_event, rootPath, port) => startLiveServer(rootPath, port))
  ipcMain.handle('liveserver:stop', () => stopLiveServer())
  ipcMain.handle('liveserver:status', () => getLiveServerStatus())

  // Git IPC Handlers
  ipcMain.handle('git:info', (_event, workspacePath) => getGitInfo(workspacePath))
  ipcMain.handle('git:clone', (_event, repoUrl, targetDir) => cloneGitRepo(repoUrl, targetDir))
  ipcMain.handle('git:commit', (_event, workspacePath, message) =>
    commitGitChanges(workspacePath, message)
  )
  ipcMain.handle('git:push', (_event, workspacePath) => pushGitChanges(workspacePath))
  ipcMain.handle('git:pull', (_event, workspacePath) => pullGitChanges(workspacePath))
  ipcMain.handle('git:diff', (_event, workspacePath, filePath) =>
    getGitFileDiff(workspacePath, filePath)
  )

  // Search IPC Handlers
  ipcMain.handle('search:workspace', (_event, workspacePath, query, options) =>
    searchWorkspace(workspacePath, query, options)
  )

  // Local ML IPC Handlers
  ipcMain.handle('ml:suggest', (_event, fullCode, lineIndex, lineContent, lang) =>
    predictInlineCompletion(fullCode, lineIndex, lineContent, lang)
  )
  ipcMain.handle('ml:train', (_event, prefix, completion, lang) =>
    trainLocalMLModel(prefix, completion, lang)
  )
  ipcMain.handle('ml:chat', (_event, prompt, code, lang, filename) =>
    generateLocalAIChatResponse(prompt, code, lang, filename)
  )
  ipcMain.handle('ml:startTraining', async (event, datasetName) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return new Promise((resolve) => {
      startModelTraining(datasetName, (progressData) => {
        if (window && !window.isDestroyed()) {
          window.webContents.send('ml:training-progress', progressData)
        }
      }).then((reportContent) => {
        resolve({ success: true, report: reportContent })
      })
    })
  })

  // TCP Pairing IPC Handlers
  ipcMain.handle('tcp:getStatus', () => {
    return { listening: true, port: 27789 }
  })
  ipcMain.handle('tcp:getClients', () => {
    return getTcpClients()
  })
  ipcMain.handle('tcp:pairClient', (_event, clientId) => {
    return pairTcpClient(clientId)
  })
  ipcMain.handle('tcp:simulateClient', (_event, name) => {
    simulateLocalClient(name)
    return true
  })
  ipcMain.handle('tcp:authSimulatedClient', (_event, token) => {
    authSimulatedClient(token)
    return true
  })
  ipcMain.handle('tcp:sendSimulatedCode', (_event, code) => {
    sendSimulatedClientCode(code)
    return true
  })
  ipcMain.handle('tcp:disconnectSimulated', () => {
    disconnectSimulatedClient()
    return true
  })
  ipcMain.handle('tcp:sendCodeChange', (_event, code) => {
    broadcastCodeToClients(code)
    return true
  })

  // Docker IPC Handlers
  ipcMain.handle('docker:containers', () => getDockerContainers())
  ipcMain.handle('docker:images', () => getDockerImages())
  ipcMain.handle('docker:start', (_event, id) => startDockerContainer(id))
  ipcMain.handle('docker:stop', (_event, id) => stopDockerContainer(id))
  ipcMain.handle('docker:restart', (_event, id) => restartDockerContainer(id))
  ipcMain.handle('docker:logs', (_event, id) => getDockerLogs(id))

  // XAMPP Services IPC Handlers
  ipcMain.handle('xampp:status', () => getXamppStatus())
  ipcMain.handle('xampp:check-installed', () => checkSystemInstalled())
  ipcMain.handle('xampp:start', async (_event, serviceName) => {
    if (serviceName === 'php') return await startPhpService()
    if (serviceName === 'mysql') return await startMysqlService()
    return { success: false, message: 'Unknown service' }
  })
  ipcMain.handle('xampp:stop', (_event, serviceName) => stopXamppService(serviceName))

  // Workspace XML Profile Handlers
  ipcMain.handle('workspace:saveXml', async (_event, data) => {
    try {
      const xmlPath = join(app.getPath('userData'), 'user_workspace_profile.xml')
      const openTabsXml = (data.openTabs || [])
        .map(
          (t) => `
    <tab id="${t.id || ''}" filename="${t.filename || ''}" lang="${t.lang || ''}">
      <path>${t.path || ''}</path>
    </tab>`
        )
        .join('')

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<userWorkspaceProfile version="1.0">
  <activePath>${data.activePath || ''}</activePath>
  <activeTabId>${data.activeTabId || ''}</activeTabId>
  <theme>${data.theme || 'vscode-dark'}</theme>
  <selectedLanguage>${data.selectedLanguage || 'Node.js'}</selectedLanguage>
  <openTabs>${openTabsXml}
  </openTabs>
</userWorkspaceProfile>`
      await fs.promises.writeFile(xmlPath, xmlContent, 'utf-8')
      return { success: true, path: xmlPath }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('workspace:loadXml', async () => {
    try {
      const xmlPath = join(app.getPath('userData'), 'user_workspace_profile.xml')
      if (!fs.existsSync(xmlPath)) return { success: false, message: 'No profile xml found.' }
      const content = await fs.promises.readFile(xmlPath, 'utf-8')
      return { success: true, xml: content }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  // GitHub Gist & RTC IPC Handlers
  ipcMain.handle('github:shareGist', (_event, filename, content, desc, isPublic, token) =>
    createGitHubGist(filename, content, desc, isPublic, token)
  )
  ipcMain.handle('rtc:createRoom', (_event, initialCode) => createRtcRoom('host_user', initialCode))
  ipcMain.handle('rtc:joinRoom', (_event, roomCode) => joinRtcRoom('peer_user', roomCode))
  ipcMain.handle('rtc:sync', (_event, roomCode, text, pos) => syncRtcCode(roomCode, text, pos))

  ipcMain.handle('get-api-port', () => process.env.API_PORT || 8000)

  // Start local TCP pairing server on port 27789
  try {
    startTcpServer(
      () => {
        const windows = BrowserWindow.getAllWindows()
        if (windows.length > 0) {
          windows[0].webContents.send('tcp:clients-update', getTcpClients())
        }
      },
      (code) => {
        const windows = BrowserWindow.getAllWindows()
        if (windows.length > 0) {
          windows[0].webContents.send('tcp:code-sync', code)
        }
      }
    )
  } catch (err) {
    console.warn('Could not start local TCP pairing server:', err.message)
  }

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
  const buildTree = async (currentPath) => {
    const name = path.basename(currentPath)
    let stat
    try {
      stat = await fs.promises.stat(currentPath)
    } catch (e) {
      return null
    }
    const key = currentPath

    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === 'out') {
        return null
      }
      let files
      try {
        files = await fs.promises.readdir(currentPath)
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
      const textExtensions = [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.py',
        '.c',
        '.cpp',
        '.cs',
        '.dart',
        '.html',
        '.css',
        '.json',
        '.md',
        '.txt',
        '.env',
        '.gitignore',
        '.yaml',
        '.yml',
        '.xml',
        '.sh',
        ''
      ]
      if (textExtensions.includes(ext) || currentPath.includes('.git') || stat.size < 500000) {
        try {
          content = await fs.promises.readFile(currentPath, 'utf-8')
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
