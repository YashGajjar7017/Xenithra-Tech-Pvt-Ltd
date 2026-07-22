import https from 'https'

/**
 * Publishes user code snippet to GitHub Gist
 * @param {string} filename 
 * @param {string} content 
 * @param {string} description 
 * @param {boolean} isPublic 
 * @param {string} githubToken 
 */
export async function createGitHubGist(filename, content, description = 'Shared from Xenithra IDE', isPublic = true, githubToken = '') {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      description: description || 'Xenithra IDE Shared Snippet',
      public: !!isPublic,
      files: {
        [filename || 'code.js']: { content: content || '// Empty file' }
      }
    })

    const headers = {
      'User-Agent': 'Xenithra-Compiler-IDE',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }

    const req = https.request({
      hostname: 'api.github.com',
      path: '/gists',
      method: 'POST',
      headers
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.html_url) {
            resolve({ success: true, url: json.html_url, id: json.id, rawUrl: json.files[filename]?.raw_url })
          } else {
            resolve({ success: false, error: json.message || 'GitHub Gist API error' })
          }
        } catch (e) {
          resolve({ success: false, error: e.message })
        }
      })
    })

    req.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })

    req.write(payload)
    req.end()
  })
}

// In-Memory RTC Session Rooms
const activeRtcRooms = new Map()

export function createRtcRoom(hostClientId, initialCode) {
  const roomCode = `RTC-${Math.floor(100000 + Math.random() * 900000)}`
  activeRtcRooms.set(roomCode, {
    code: roomCode,
    host: hostClientId,
    peers: [],
    currentText: initialCode || ''
  })
  return { success: true, roomCode }
}

export function joinRtcRoom(peerClientId, roomCode) {
  const room = activeRtcRooms.get(roomCode)
  if (!room) {
    return { success: false, error: `RTC Room "${roomCode}" not found or expired.` }
  }
  if (!room.peers.includes(peerClientId)) {
    room.peers.push(peerClientId)
  }
  return { success: true, roomCode, currentText: room.currentText, peersCount: room.peers.length + 1 }
}

export function syncRtcCode(roomCode, text, cursorPosition) {
  const room = activeRtcRooms.get(roomCode)
  if (!room) return { success: false }
  room.currentText = text
  return { success: true, roomCode, currentText: text, cursorPosition }
}
