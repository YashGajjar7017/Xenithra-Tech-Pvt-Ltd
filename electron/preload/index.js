import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Suppress specific DevTools errors
const originalConsoleError = console.error
console.error = (...args) => {
  const errorMessage = args.join(' ')
  if (
    errorMessage.includes('Autofill.enable') ||
    errorMessage.includes('Autofill.setAddresses') ||
    errorMessage.includes("Unexpected token 'H'") ||
    errorMessage.includes('is not valid JSON')
  ) {
    return // Suppress these errors
  }
  originalConsoleError(...args)
}

const api = {
  // Renderer can register callbacks for messages from main
  onOpenFiles: (cb) => ipcRenderer.on('open-files', (_event, files) => cb(files)),
  onOpenDirectory: (cb) => ipcRenderer.on('open-directory', (_event, dirResult) => cb(dirResult)),
  onToggleTheme: (cb) => ipcRenderer.on('toggle-theme', () => cb()),
  onDeepLinkToken: (cb) => ipcRenderer.on('deep-link-token', (_event, data) => cb(data)),
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (content, defaultName) =>
    ipcRenderer.invoke('dialog:saveFile', content, defaultName),
  saveFile: (filePath, content) => ipcRenderer.invoke('file:save', filePath, content),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
  readDirectory: (dirPath) => ipcRenderer.invoke('file:readDirectory', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  getApiPort: () => ipcRenderer.invoke('get-api-port'),
  getExtensions: () => ipcRenderer.invoke('extensions:get'),
  saveExtensions: (extensions) => ipcRenderer.invoke('extensions:save', extensions),

  // Firebase API
  getFirebaseConfig: () => ipcRenderer.invoke('firebase:getConfig'),
  saveFirebaseConfig: (projectId, apiKey) =>
    ipcRenderer.invoke('firebase:saveConfig', projectId, apiKey),
  disconnectFirebase: () => ipcRenderer.invoke('firebase:disconnect'),
  getFirebaseUsers: () => ipcRenderer.invoke('firebase:getUsers'),
  addFirebaseUser: (email, password) => ipcRenderer.invoke('firebase:addUser', email, password),
  deleteFirebaseUser: (uid) => ipcRenderer.invoke('firebase:deleteUser', uid),
  getFirestoreCollections: () => ipcRenderer.invoke('firebase:getCollections'),
  addFirestoreDocument: (col, docId, data) =>
    ipcRenderer.invoke('firebase:addDocument', col, docId, data),
  deleteFirestoreDocument: (col, docId) =>
    ipcRenderer.invoke('firebase:deleteDocument', col, docId),
  deployFirebaseHosting: (projectId) => ipcRenderer.invoke('firebase:deploy', projectId),

  // Store Extensions API
  getStoreExtensions: () => ipcRenderer.invoke('extensions:getStore'),
  uploadStoreExtension: (xmlPath) => ipcRenderer.invoke('extensions:uploadStore', xmlPath),
  uploadStoreExtensionXmlContent: (xmlContent) =>
    ipcRenderer.invoke('extensions:uploadStoreXmlContent', xmlContent),

  // Terminal API
  initTerminal: (cwd) => ipcRenderer.invoke('terminal:init', cwd),
  writeTerminal: (input) => ipcRenderer.invoke('terminal:write', input),
  killTerminal: () => ipcRenderer.invoke('terminal:kill'),
  executeTerminal: (cmd, cwd) => ipcRenderer.invoke('terminal:execute', cmd, cwd),
  onTerminalData: (cb) => ipcRenderer.on('terminal:data', (_event, data) => cb(data)),

  // Live Server API
  startLiveServer: (rootPath, port) => ipcRenderer.invoke('liveserver:start', rootPath, port),
  stopLiveServer: () => ipcRenderer.invoke('liveserver:stop'),
  getLiveServerStatus: () => ipcRenderer.invoke('liveserver:status'),

  // Git API
  getGitInfo: (workspacePath) => ipcRenderer.invoke('git:info', workspacePath),
  cloneGitRepo: (repoUrl, targetDir) => ipcRenderer.invoke('git:clone', repoUrl, targetDir),
  commitGitChanges: (workspacePath, message) =>
    ipcRenderer.invoke('git:commit', workspacePath, message),
  pushGitChanges: (workspacePath) => ipcRenderer.invoke('git:push', workspacePath),
  pullGitChanges: (workspacePath) => ipcRenderer.invoke('git:pull', workspacePath),
  getGitFileDiff: (workspacePath, filePath) =>
    ipcRenderer.invoke('git:diff', workspacePath, filePath),

  // Search API
  searchWorkspace: (workspacePath, query, options) =>
    ipcRenderer.invoke('search:workspace', workspacePath, query, options),

  // Local ML API
  predictInlineCompletion: (fullCode, lineIndex, lineContent, lang) =>
    ipcRenderer.invoke('ml:suggest', fullCode, lineIndex, lineContent, lang),
  trainML: (prefix, completion, lang) => ipcRenderer.invoke('ml:train', prefix, completion, lang),
  generateLocalAIChat: (prompt, code, lang, filename) =>
    ipcRenderer.invoke('ml:chat', prompt, code, lang, filename),

  // Docker API
  getDockerContainers: () => ipcRenderer.invoke('docker:containers'),
  getDockerImages: () => ipcRenderer.invoke('docker:images'),
  startDockerContainer: (id) => ipcRenderer.invoke('docker:start', id),
  stopDockerContainer: (id) => ipcRenderer.invoke('docker:stop', id),
  restartDockerContainer: (id) => ipcRenderer.invoke('docker:restart', id),
  getDockerLogs: (id) => ipcRenderer.invoke('docker:logs', id),

  // Workspace XML API
  saveWorkspaceXml: (data) => ipcRenderer.invoke('workspace:saveXml', data),
  loadWorkspaceXml: () => ipcRenderer.invoke('workspace:loadXml'),

  // Collaboration API
  shareGitHubGist: (filename, content, desc, isPublic, token) =>
    ipcRenderer.invoke('github:shareGist', filename, content, desc, isPublic, token),
  createRtcRoom: (initialCode) => ipcRenderer.invoke('rtc:createRoom', initialCode),
  joinRtcRoom: (roomCode) => ipcRenderer.invoke('rtc:joinRoom', roomCode),
  syncRtcCode: (roomCode, text, pos) => ipcRenderer.invoke('rtc:sync', roomCode, text, pos),

  // TCP Pairing API
  getTcpStatus: () => ipcRenderer.invoke('tcp:getStatus'),
  getTcpClients: () => ipcRenderer.invoke('tcp:getClients'),
  pairTcpClient: (clientId) => ipcRenderer.invoke('tcp:pairClient', clientId),
  simulateTcpClient: (name) => ipcRenderer.invoke('tcp:simulateClient', name),
  authSimulatedClient: (token) => ipcRenderer.invoke('tcp:authSimulatedClient', token),
  sendSimulatedCode: (code) => ipcRenderer.invoke('tcp:sendSimulatedCode', code),
  disconnectSimulated: () => ipcRenderer.invoke('tcp:disconnectSimulated'),
  sendTcpCodeChange: (code) => ipcRenderer.invoke('tcp:sendCodeChange', code),
  onTcpClientsUpdate: (cb) => ipcRenderer.on('tcp:clients-update', (_event, clients) => cb(clients)),
  onTcpCodeSync: (cb) => ipcRenderer.on('tcp:code-sync', (_event, code) => cb(code)),
  onSimulatedClientCode: (cb) => ipcRenderer.on('tcp:simulated-client-code', (_event, code) => cb(code)),
  onSimulatedClientAuth: (cb) => ipcRenderer.on('tcp:simulated-client-auth', (_event, success) => cb(success)),

  // ML Training API
  startModelTraining: (datasetName) => ipcRenderer.invoke('ml:startTraining', datasetName),
  onTrainingProgress: (cb) => ipcRenderer.on('ml:training-progress', (_event, progress) => cb(progress)),

  // XAMPP Service API
  getXamppStatus: () => ipcRenderer.invoke('xampp:status'),
  checkXamppInstalled: () => ipcRenderer.invoke('xampp:check-installed'),
  startXamppService: (service) => ipcRenderer.invoke('xampp:start', service),
  stopXamppService: (service) => ipcRenderer.invoke('xampp:stop', service)
}

// Expose APIs to renderer. Prefer contextBridge when available (recommended).
try {
  if (contextBridge && typeof contextBridge.exposeInMainWorld === 'function') {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } else {
    // Fallback for older environments / tests
    window.electron = electronAPI
    window.api = api
  }
} catch (error) {
  console.error('Preload expose error:', error)
}
