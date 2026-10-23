import net from 'net'

export const TCP_PORT = 6000

// Connected clients memory store
let connectedClients = []
let serverInstance = null
let onClientsChangeCallback = null
let onCodeSyncCallback = null

// Simulated local client instances (mapped by simulatedId or name)
let simulatedSockets = {}

// Outbound client connection state
let outboundSocket = null
let currentWorkspaceCode = ''

const CLIENT_COLORS = [
  '#00ffaa',
  '#58a6ff',
  '#df73ff',
  '#ff9f00',
  '#ff00c8',
  '#00f3ff',
  '#f1fa8c',
  '#50fa7b'
]

/**
 * Broadcast current active collaborators list to Electron frontend
 */
export function broadcastCollaborators() {
  try {
    const { BrowserWindow } = require('electron')
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      windows[0].webContents.send('tcp:collaborators-update', getCollaborators())
    }
  } catch (e) {
    // BrowserWindow may not be ready yet
  }
}

/**
 * Starts the TCP server on port 6000
 * @param {Function} onClientsUpdate - Callback when client list changes
 * @param {Function} onCodeSync - Callback when an authenticated client sends code
 */
export function startTcpServer(onClientsUpdate, onCodeSync) {
  if (serverInstance) {
    console.log(`[TCP Server] Already running on port ${TCP_PORT}.`)
    return
  }

  onClientsChangeCallback = onClientsUpdate
  onCodeSyncCallback = onCodeSync

  serverInstance = net.createServer((socket) => {
    const clientId = 'client_' + Math.random().toString(36).substr(2, 9)
    const clientIp = socket.remoteAddress ? socket.remoteAddress.replace(/^.*:/, '') : '127.0.0.1'
    const pairingToken = Math.floor(100000 + Math.random() * 900000).toString()
    const color = CLIENT_COLORS[connectedClients.length % CLIENT_COLORS.length]

    const newClient = {
      id: clientId,
      name: `User ${connectedClients.length + 1}`,
      color: color,
      ip: clientIp,
      token: pairingToken,
      authenticated: false,
      socket: socket,
      activeFile: 'untitled'
    }

    connectedClients.push(newClient)
    console.log(`[TCP Server 6000] Client connected from ${clientIp}. Assigned ID: ${clientId}`)

    // Notify connection
    if (onClientsChangeCallback) onClientsChangeCallback()
    broadcastCollaborators()

    // Send initial status to client
    socket.write(
      JSON.stringify({
        type: 'hello',
        status: 'unauthenticated',
        tokenRequired: true,
        port: TCP_PORT,
        assignedColor: color
      }) + '\n'
    )

    let dataBuffer = ''
    socket.on('data', (data) => {
      dataBuffer += data.toString()
      const lines = dataBuffer.split('\n')
      dataBuffer = lines.pop()

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const message = JSON.parse(line)
          handleClientMessage(newClient, message)
        } catch (e) {
          console.warn('[TCP Server] Error parsing client message:', e.message)
        }
      }
    })

    socket.on('close', () => {
      console.log(`[TCP Server] Client disconnected: ${newClient.name} (${clientId})`)
      connectedClients = connectedClients.filter((c) => c.id !== clientId)
      if (onClientsChangeCallback) onClientsChangeCallback()
      broadcastCollaborators()
    })

    socket.on('error', (err) => {
      console.error(`[TCP Server] Client socket error (${clientId}):`, err.message)
    })
  })

  serverInstance.on('error', (err) => {
    console.error(`[TCP Server] Server socket error on port ${TCP_PORT}:`, err.message)
  })

  serverInstance.listen(TCP_PORT, '0.0.0.0', () => {
    console.log(`[TCP Server] listening on port ${TCP_PORT} (0.0.0.0) for local network coding`)
  })
}

/**
 * Handle incoming messages from TCP clients
 */
function handleClientMessage(client, message) {
  console.log(`[TCP Server] Received from ${client.id} (${client.name}):`, message.type)

  switch (message.type) {
    case 'handshake':
      client.name = message.username || message.deviceName || client.name
      if (message.color) client.color = message.color
      if (message.activeFile) client.activeFile = message.activeFile
      if (onClientsChangeCallback) onClientsChangeCallback()
      broadcastCollaborators()
      break

    case 'profile':
      if (message.name) client.name = message.name
      if (message.color) client.color = message.color
      if (message.activeFile) client.activeFile = message.activeFile
      if (onClientsChangeCallback) onClientsChangeCallback()
      broadcastCollaborators()
      break

    case 'auth':
      // Authenticate if token matches or autoAuth flag is passed
      if (message.token === client.token || message.autoAuth === true) {
        client.authenticated = true
        if (message.username) client.name = message.username
        client.socket.write(
          JSON.stringify({ type: 'auth_response', success: true, clientId: client.id }) + '\n'
        )
        console.log(`[TCP Server] Client paired & authenticated successfully: ${client.name}`)
        if (onClientsChangeCallback) onClientsChangeCallback()
        broadcastCollaborators()

        // Immediately sync current workspace code upon pairing
        if (currentWorkspaceCode) {
          client.socket.write(
            JSON.stringify({ type: 'code_change', code: currentWorkspaceCode }) + '\n'
          )
        }
      } else {
        client.socket.write(
          JSON.stringify({ type: 'auth_response', success: false, error: 'Invalid token' }) + '\n'
        )
        console.warn(`[TCP Server] Authentication failed for ${client.name}. Invalid token.`)
      }
      break

    case 'code_change':
      if (client.authenticated) {
        currentWorkspaceCode = message.code
        if (onCodeSyncCallback) {
          onCodeSyncCallback(message.code)
        }
        // Broadcast code to other authenticated clients
        connectedClients.forEach((c) => {
          if (c.id !== client.id && c.authenticated && c.socket && !c.socket.destroyed) {
            try {
              c.socket.write(JSON.stringify({ type: 'code_change', code: message.code }) + '\n')
            } catch (err) {}
          }
        })
      } else {
        client.socket.write(
          JSON.stringify({ type: 'error', message: 'Unauthorized. Pair first.' }) + '\n'
        )
      }
      break

    case 'cursor_activity':
      if (client.authenticated) {
        client.activeFile = message.filename || client.activeFile
        // Forward cursor activity to the host window
        try {
          const { BrowserWindow } = require('electron')
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].webContents.send('tcp:cursor-sync', {
              cursorIndex: message.cursorIndex,
              username: message.username || client.name,
              filename: message.filename,
              color: client.color
            })
          }
        } catch (e) {}

        // Broadcast it to other connected clients
        connectedClients.forEach((c) => {
          if (c.id !== client.id && c.authenticated && c.socket && !c.socket.destroyed) {
            try {
              c.socket.write(JSON.stringify(message) + '\n')
            } catch (err) {}
          }
        })
      }
      break

    default:
      console.warn('[TCP Server] Unknown message type:', message.type)
  }
}

/**
 * Get client list (serializable, no raw sockets)
 */
export function getTcpClients() {
  return connectedClients.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color || '#58a6ff',
    ip: c.ip,
    token: c.token,
    authenticated: c.authenticated,
    activeFile: c.activeFile || 'untitled'
  }))
}

/**
 * Get clean list of collaborators with active details
 */
export function getCollaborators() {
  return connectedClients.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color || '#58a6ff',
    ip: c.ip,
    authenticated: c.authenticated,
    activeFile: c.activeFile || 'untitled'
  }))
}

/**
 * Retrieve pairing token for a client
 */
export function pairTcpClient(clientId) {
  const client = connectedClients.find((c) => c.id === clientId)
  return client ? client.token : null
}

/**
 * Broadcast active IDE code contents to all authenticated TCP clients
 */
export function broadcastCodeToClients(code) {
  currentWorkspaceCode = code // Cache locally

  connectedClients.forEach((client) => {
    if (client.authenticated && client.socket && !client.socket.destroyed) {
      try {
        client.socket.write(JSON.stringify({ type: 'code_change', code }) + '\n')
      } catch (err) {
        console.error(`[TCP Server] Broadcast failed to ${client.name}:`, err.message)
      }
    }
  })

  // Also send to outbound host connection
  if (outboundSocket && !outboundSocket.destroyed) {
    try {
      outboundSocket.write(JSON.stringify({ type: 'code_change', code }) + '\n')
    } catch (err) {
      console.error(`[TCP Outbound Client] Failed to send code to host:`, err.message)
    }
  }
}

/**
 * Broadcast local cursor events to all clients and outbound connections
 */
export function broadcastCursorToClients(cursorIndex, username, filename) {
  const payload =
    JSON.stringify({ type: 'cursor_activity', cursorIndex, username, filename }) + '\n'

  connectedClients.forEach((client) => {
    if (client.authenticated && client.socket && !client.socket.destroyed) {
      try {
        client.socket.write(payload)
      } catch (err) {}
    }
  })

  if (outboundSocket && !outboundSocket.destroyed) {
    try {
      outboundSocket.write(payload)
    } catch (err) {}
  }
}

/**
 * Outbound Client Connections: Connects to a remote TCP Server (default port 6000)
 */
export function connectToRemoteHost(
  ip = '127.0.0.1',
  port = TCP_PORT,
  onSync,
  onAuthResult,
  onCursorSync,
  onDisconnect
) {
  if (outboundSocket) {
    outboundSocket.destroy()
    outboundSocket = null
  }

  const targetPort = port || TCP_PORT
  console.log(`[TCP Outbound Client] Connecting to remote server at ${ip}:${targetPort}...`)
  outboundSocket = net.connect(targetPort, ip, () => {
    console.log(`[TCP Outbound Client] Connected to ${ip}:${targetPort}. Sending handshake.`)
    outboundSocket.write(
      JSON.stringify({
        type: 'handshake',
        deviceName: 'Developer Remote App',
        username: 'Guest Collaborator'
      }) + '\n'
    )
  })

  let dataBuffer = ''
  outboundSocket.on('data', (data) => {
    dataBuffer += data.toString()
    const lines = dataBuffer.split('\n')
    dataBuffer = lines.pop()

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const msg = JSON.parse(line)
        console.log('[TCP Outbound Client] Received:', msg.type)

        if (msg.type === 'code_change') {
          if (onSync) onSync(msg.code)
        } else if (msg.type === 'auth_response') {
          if (onAuthResult) onAuthResult(msg.success)
        } else if (msg.type === 'cursor_activity') {
          if (onCursorSync) onCursorSync(msg)
        }
      } catch (e) {
        console.error('[TCP Outbound Client] Parse error:', e.message)
      }
    }
  })

  outboundSocket.on('close', () => {
    console.log('[TCP Outbound Client] Connection closed.')
    outboundSocket = null
    if (onDisconnect) onDisconnect()
  })

  outboundSocket.on('error', (err) => {
    console.error('[TCP Outbound Client] Socket error:', err.message)
    if (onDisconnect) onDisconnect()
  })
}

export function authOutboundClient(token) {
  if (outboundSocket && !outboundSocket.destroyed) {
    outboundSocket.write(JSON.stringify({ type: 'auth', token }) + '\n')
    return true
  }
  return false
}

export function disconnectOutboundClient() {
  if (outboundSocket) {
    outboundSocket.destroy()
    outboundSocket = null
    return true
  }
  return false
}

/**
 * Spins up a simulated client inside the main process to connect to port 6000
 * Supports multiple concurrent simulated users
 * @param {string} name - Device or user name
 * @param {string} color - Optional color badge
 */
export function simulateLocalClient(name = 'Dev-Alex', color = '#58a6ff') {
  const socketId = 'sim_' + Math.random().toString(36).substr(2, 7)

  const socket = net.connect(TCP_PORT, '127.0.0.1', () => {
    console.log(`[TCP Simulator] Simulated client '${name}' connected to localhost:${TCP_PORT}.`)
    socket.write(
      JSON.stringify({
        type: 'handshake',
        username: name,
        deviceName: name,
        color: color
      }) + '\n'
    )
  })

  simulatedSockets[socketId] = {
    id: socketId,
    name: name,
    socket: socket
  }

  socket.on('data', (data) => {
    const lines = data.toString().split('\n')
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const msg = JSON.parse(line)
        if (msg.type === 'hello' && msg.status === 'unauthenticated') {
          // Auto-authenticate simulated clients for fast collaborative testing
          setTimeout(() => {
            if (!socket.destroyed) {
              socket.write(
                JSON.stringify({
                  type: 'auth',
                  autoAuth: true,
                  username: name
                }) + '\n'
              )
            }
          }, 150)
        } else if (msg.type === 'code_change') {
          try {
            const { BrowserWindow } = require('electron')
            const windows = BrowserWindow.getAllWindows()
            if (windows.length > 0) {
              windows[0].webContents.send('tcp:simulated-client-code', msg.code)
            }
          } catch (e) {}
        } else if (msg.type === 'auth_response') {
          try {
            const { BrowserWindow } = require('electron')
            const windows = BrowserWindow.getAllWindows()
            if (windows.length > 0) {
              windows[0].webContents.send('tcp:simulated-client-auth', msg.success)
            }
          } catch (e) {}
        }
      } catch (e) {}
    }
  })

  socket.on('close', () => {
    console.log(`[TCP Simulator] Simulated client '${name}' disconnected.`)
    delete simulatedSockets[socketId]
  })

  socket.on('error', (err) => {
    console.error(`[TCP Simulator] Error on client '${name}':`, err.message)
    delete simulatedSockets[socketId]
  })

  return socketId
}

/**
 * Authenticates the main simulated client by sending the token
 */
export function authSimulatedClient(token) {
  const keys = Object.keys(simulatedSockets)
  if (keys.length > 0) {
    const lastSocket = simulatedSockets[keys[keys.length - 1]].socket
    if (lastSocket && !lastSocket.destroyed) {
      lastSocket.write(JSON.stringify({ type: 'auth', token }) + '\n')
    }
  }
}

/**
 * Sends code updates from simulated client back to server
 */
export function sendSimulatedClientCode(code, socketId) {
  if (socketId && simulatedSockets[socketId]) {
    const s = simulatedSockets[socketId].socket
    if (s && !s.destroyed) {
      s.write(JSON.stringify({ type: 'code_change', code }) + '\n')
      return
    }
  }
  const keys = Object.keys(simulatedSockets)
  if (keys.length > 0) {
    const s = simulatedSockets[keys[keys.length - 1]].socket
    if (s && !s.destroyed) {
      s.write(JSON.stringify({ type: 'code_change', code }) + '\n')
    }
  }
}

/**
 * Disconnects a specific or all simulated clients
 */
export function disconnectSimulatedClient(socketId) {
  if (socketId && simulatedSockets[socketId]) {
    simulatedSockets[socketId].socket.destroy()
    delete simulatedSockets[socketId]
    return
  }
  Object.keys(simulatedSockets).forEach((id) => {
    try {
      simulatedSockets[id].socket.destroy()
    } catch (e) {}
  })
  simulatedSockets = {}
}
