import net from 'net'

// Connected clients memory store
let connectedClients = []
let serverInstance = null
let onClientsChangeCallback = null
let onCodeSyncCallback = null

// Simulated local client state
let simulatedSocket = null

/**
 * Starts the TCP server on port 27789
 * @param {Function} onClientsUpdate - Callback when client list changes
 * @param {Function} onCodeSync - Callback when an authenticated client sends code
 */
export function startTcpServer(onClientsUpdate, onCodeSync) {
  if (serverInstance) {
    console.log('[TCP Server] Already running.')
    return
  }

  onClientsChangeCallback = onClientsUpdate
  onCodeSyncCallback = onCodeSync

  serverInstance = net.createServer((socket) => {
    const clientId = 'client_' + Math.random().toString(36).substr(2, 9)
    const clientIp = socket.remoteAddress || '127.0.0.1'
    const pairingToken = Math.floor(100000 + Math.random() * 900000).toString()

    const newClient = {
      id: clientId,
      name: 'TCP/IP Client',
      ip: clientIp,
      token: pairingToken,
      authenticated: false,
      socket: socket
    }

    connectedClients.push(newClient)
    console.log(`[TCP Server] Client connected from ${clientIp}. Assigned ID: ${clientId}`)

    // Notify connection
    if (onClientsChangeCallback) onClientsChangeCallback()

    // Send initial status to client
    socket.write(JSON.stringify({ type: 'hello', status: 'unauthenticated' }) + '\n')

    let dataBuffer = ''
    socket.on('data', (data) => {
      dataBuffer += data.toString()
      const lines = dataBuffer.split('\n')
      // Save last unfinished line
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
      console.log(`[TCP Server] Client disconnected: ${clientId}`)
      connectedClients = connectedClients.filter((c) => c.id !== clientId)
      if (onClientsChangeCallback) onClientsChangeCallback()
    })

    socket.on('error', (err) => {
      console.error(`[TCP Server] Client socket error (${clientId}):`, err.message)
    })
  })

  serverInstance.listen(27789, '0.0.0.0', () => {
    console.log('[TCP Server] listening on port 27789')
  })
}

/**
 * Handle incoming messages from TCP clients
 */
function handleClientMessage(client, message) {
  console.log(`[TCP Server] Received from ${client.id}:`, message)

  switch (message.type) {
    case 'handshake':
      client.name = message.deviceName || client.name
      if (onClientsChangeCallback) onClientsChangeCallback()
      break

    case 'auth':
      if (message.token === client.token) {
        client.authenticated = true
        client.socket.write(JSON.stringify({ type: 'auth_response', success: true }) + '\n')
        console.log(`[TCP Server] Client paired & authenticated successfully: ${client.name}`)
        if (onClientsChangeCallback) onClientsChangeCallback()
      } else {
        client.socket.write(JSON.stringify({ type: 'auth_response', success: false, error: 'Invalid token' }) + '\n')
        console.warn(`[TCP Server] Authentication failed for ${client.name}. Invalid token.`)
      }
      break

    case 'code_change':
      if (client.authenticated) {
        if (onCodeSyncCallback) {
          onCodeSyncCallback(message.code)
        }
      } else {
        client.socket.write(JSON.stringify({ type: 'error', message: 'Unauthorized. Pair first.' }) + '\n')
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
    ip: c.ip,
    token: c.token,
    authenticated: c.authenticated
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
  connectedClients.forEach((client) => {
    if (client.authenticated && client.socket && !client.socket.destroyed) {
      try {
        client.socket.write(JSON.stringify({ type: 'code_change', code }) + '\n')
      } catch (err) {
        console.error(`[TCP Server] Broadcast failed to ${client.name}:`, err.message)
      }
    }
  })
}

/**
 * Spins up a simulated client inside the main process to connect to port 27789
 * @param {string} name - Device name of the simulated client
 */
export function simulateLocalClient(name = 'Developer iPad') {
  if (simulatedSocket) {
    simulatedSocket.destroy()
    simulatedSocket = null
  }

  simulatedSocket = net.connect(27789, '127.0.0.1', () => {
    console.log('[TCP Simulator] Simulated client connected to server.')
    // Send handshake
    simulatedSocket.write(JSON.stringify({ type: 'handshake', deviceName: name }) + '\n')
  })

  simulatedSocket.on('data', (data) => {
    const lines = data.toString().split('\n')
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const msg = JSON.parse(line)
        console.log('[TCP Simulator] Received from server:', msg)
        // If code sync is received, dispatch it locally to the simulator if needed
        if (msg.type === 'code_change') {
          // Send to frontend as event
          const { BrowserWindow } = require('electron')
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].webContents.send('tcp:simulated-client-code', msg.code)
          }
        } else if (msg.type === 'auth_response') {
          const { BrowserWindow } = require('electron')
          const windows = BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].webContents.send('tcp:simulated-client-auth', msg.success)
          }
        }
      } catch (e) {}
    }
  })

  simulatedSocket.on('close', () => {
    console.log('[TCP Simulator] Simulated client disconnected.')
    simulatedSocket = null
  })

  simulatedSocket.on('error', (err) => {
    console.error('[TCP Simulator] Error:', err.message)
  })
}

/**
 * Authenticates the simulated client by sending the token
 */
export function authSimulatedClient(token) {
  if (simulatedSocket && !simulatedSocket.destroyed) {
    simulatedSocket.write(JSON.stringify({ type: 'auth', token }) + '\n')
  }
}

/**
 * Sends code updates from the simulated client back to the server
 */
export function sendSimulatedClientCode(code) {
  if (simulatedSocket && !simulatedSocket.destroyed) {
    simulatedSocket.write(JSON.stringify({ type: 'code_change', code }) + '\n')
  }
}

/**
 * Disconnects the simulated client
 */
export function disconnectSimulatedClient() {
  if (simulatedSocket) {
    simulatedSocket.destroy()
    simulatedSocket = null
  }
}
