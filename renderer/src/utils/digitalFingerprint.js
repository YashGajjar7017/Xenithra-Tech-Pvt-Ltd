/**
 * Digital Fingerprint & Session Signature Utility
 * Generates unique hardware & browser client digital fingerprints using Web Crypto API.
 */

async function sha256(str) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no-canvas'
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Xenithra-Tech-IDE-Security', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Xenithra-Tech-IDE-Security', 4, 17)
    return canvas.toDataURL()
  } catch (e) {
    return 'canvas-error'
  }
}

function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'no-webgl'
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'no-debug-info'
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
    return `${vendor}~${renderer}`
  } catch (e) {
    return 'webgl-error'
  }
}

/**
 * Generates the full digital fingerprint object and hash
 */
export async function generateDigitalFingerprint() {
  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language || navigator.userLanguage,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    deviceMemory: navigator.deviceMemory || 8,
    screenResolution: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    pixelRatio: window.devicePixelRatio || 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    timezoneOffset: new Date().getTimezoneOffset(),
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint()
  }

  const rawString = JSON.stringify(components)
  const fingerprintHash = await sha256(rawString)

  const fingerprintData = {
    fingerprint: fingerprintHash,
    shortFingerprint: fingerprintHash.substring(0, 12).toUpperCase(),
    components: {
      platform: components.platform,
      resolution: components.screenResolution,
      timezone: components.timezone,
      webgl: components.webgl
    },
    generatedAt: new Date().toISOString()
  }

  // Cache locally
  localStorage.setItem('xenithra-digital-fingerprint', fingerprintHash)
  localStorage.setItem('xenithra-fingerprint-meta', JSON.stringify(fingerprintData))

  return fingerprintData
}

/**
 * Verify active session with the backend server
 */
export async function verifyServerSession(apiPort = 8000) {
  try {
    const storedSession = localStorage.getItem('xenithra-session')
    const fingerprint = localStorage.getItem('xenithra-digital-fingerprint')
    const token = localStorage.getItem('xenithra-session-token')

    if (!storedSession || !fingerprint) {
      return { verified: false, reason: 'No active session or fingerprint found' }
    }

    const sessionObj = JSON.parse(storedSession)
    const port = localStorage.getItem('api-port') || apiPort

    const res = await fetch(`http://localhost:${port}/api/auth/verify-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionObj.sessionId,
        fingerprint,
        token
      })
    })

    if (!res.ok) {
      const err = await res.json()
      return { verified: false, reason: err.message || 'Session verification rejected by server' }
    }

    const data = await res.json()
    return data
  } catch (err) {
    return { verified: false, reason: err.message }
  }
}
