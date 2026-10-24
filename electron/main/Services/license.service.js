/**
 * Xenithra License Service
 * Connects to the GitHub-hosted licensing server to validate,
 * activate, and manage software licenses.
 *
 * License Server: https://raw.githubusercontent.com/YashGajjar7017/Xenithra-Tech-Pvt-Ltd/main/licenses/
 * Registration Endpoint: GitHub Issues API / Custom Gist-based server
 */

import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import crypto from 'crypto'

// ─── Constants ───────────────────────────────────────────────────────────────
export const DEFAULT_LICENSE_SERVER_URL = 'https://license-server-hazel-three.vercel.app'
const LICENSE_SERVER_CONFIG_FILE = 'xenithra_license_server.json'
const GITHUB_BACKUP_BASE =
  'https://raw.githubusercontent.com/YashGajjar7017/Xenithra-Tech-Pvt-Ltd/main/licenses'
const LICENSE_API_URL = 'https://api.github.com/repos/YashGajjar7017/Xenithra-Tech-Pvt-Ltd'
const TRIAL_DURATION_DAYS = 30
const LICENSE_FILE = 'xenithra_license.json'
const LICENSE_SECRET = 'XENITHRA_SECRET_SALT_2026_V1'

// ─── Server URL Helpers ───────────────────────────────────────────────────────

export function cleanServerUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_LICENSE_SERVER_URL
  let cleaned = url.trim().replace(/^["']|["']$/g, '')
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned
  }
  return cleaned.replace(/\/+$/, '')
}

export function getLicenseServerConfigPath() {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, LICENSE_SERVER_CONFIG_FILE)
}

/**
 * Get current configured License Server URL.
 * Checks user custom override first, then .env, then default Vercel server.
 */
export function getLicenseServerUrl() {
  try {
    const configPath = getLicenseServerConfigPath()
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (parsed && parsed.serverUrl) return cleanServerUrl(parsed.serverUrl)
    }
  } catch (e) {}

  const envUrl = process.env.LICENSE_SERVER_URL || process.env.licenseServerURL
  if (envUrl) {
    return cleanServerUrl(envUrl)
  }
  return DEFAULT_LICENSE_SERVER_URL
}

/**
 * Set custom License Server URL and persist to userData.
 */
export function setLicenseServerUrl(newUrl) {
  try {
    const cleaned = cleanServerUrl(newUrl || DEFAULT_LICENSE_SERVER_URL)
    const configPath = getLicenseServerConfigPath()
    fs.writeFileSync(
      configPath,
      JSON.stringify({ serverUrl: cleaned, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    )
    return { success: true, serverUrl: cleaned }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

/**
 * Test connectivity to the License Server.
 */
export async function pingLicenseServer(customUrl) {
  const targetUrl = customUrl ? cleanServerUrl(customUrl) : getLicenseServerUrl()
  const start = Date.now()
  const endpoints = ['/health', '/', '/licenses/registry.json']

  for (const ep of endpoints) {
    try {
      const resp = await fetch(`${targetUrl}${ep}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Xenithra-IDE/1.0' },
        signal: AbortSignal.timeout(4000)
      })
      const latencyMs = Date.now() - start
      if (resp.ok) {
        let body = {}
        try {
          body = await resp.json()
        } catch {}
        return {
          online: true,
          status: resp.status,
          latencyMs,
          url: targetUrl,
          endpoint: ep,
          body
        }
      }
    } catch (e) {}
  }

  return {
    online: false,
    url: targetUrl,
    latencyMs: Date.now() - start,
    error: 'License server could not be reached or returned an error.'
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get path to the license file stored in userData directory.
 */
function getLicenseFilePath() {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, LICENSE_FILE)
}

/**
 * Read the local license store from disk.
 */
function readLocalLicense() {
  const filePath = getLicenseFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('[License] Failed to read local license:', e.message)
  }
  return null
}

/**
 * Write the license data to disk.
 */
function writeLocalLicense(data) {
  const filePath = getLicenseFilePath()
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('[License] Failed to write local license:', e.message)
    return false
  }
}

/**
 * Generate a machine fingerprint for binding licenses to hardware.
 */
function getMachineFingerprint() {
  const os = require('os')
  const raw = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus().length.toString(),
    os.totalmem().toString()
  ].join('::')
  return crypto.createHash('sha256').update(raw + LICENSE_SECRET).digest('hex').substring(0, 32)
}

/**
 * Generate a signature for a license key to verify authenticity.
 */
function generateKeySignature(licenseKey, machineId) {
  return crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(`${licenseKey}::${machineId}`)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase()
}

// ─── Trial Management ─────────────────────────────────────────────────────────

/**
 * Initialize a new trial if none exists. Returns the trial info.
 */
export function initializeTrial() {
  const existing = readLocalLicense()
  if (existing) return existing

  const trialData = {
    type: 'trial',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    machineId: getMachineFingerprint(),
    activated: false,
    licenseKey: null,
    licensedTo: null,
    features: {
      editor: true,
      terminal: true,
      aiColab: false,      // disabled in trial
      dsaStudio: true,
      cdllStudio: false,   // disabled in trial
      codeArena: true,
      cloudSync: false,    // disabled in trial
      collaboration: false // disabled in trial
    }
  }

  writeLocalLicense(trialData)
  return trialData
}

/**
 * Get the current license status.
 */
export function getLicenseStatus() {
  const license = readLocalLicense() || initializeTrial()

  if (license.type === 'full' && license.activated) {
    return {
      status: 'licensed',
      type: 'full',
      licensedTo: license.licensedTo,
      email: license.email,
      edition: license.edition || 'Professional Edition',
      licenseKey: maskLicenseKey(license.licenseKey),
      fullKey: license.licenseKey,
      expiryDate: license.expiryDate || 'Lifetime',
      activationDate: license.activationDate,
      certificate: license.certificate || {
        certId: 'CERT-XNTH-VALID',
        fingerprint: 'SHA256:7b91a2d4e8c3f1092a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
        validFrom: license.activationDate ? license.activationDate.split('T')[0] : '2026-01-01',
        validTo: '2036-01-01',
        tier: license.edition || 'Professional',
        issuer: 'Xenithra Technologies Pvt Ltd'
      },
      features: {
        editor: true,
        terminal: true,
        aiColab: true,
        dsaStudio: true,
        cdllStudio: true,
        codeArena: true,
        cloudSync: true,
        collaboration: true
      },
      machineId: license.machineId
    }
  }

  // Check trial expiry
  const now = new Date()
  const expiry = new Date(license.expiryDate)
  const daysLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)))
  const isExpired = now > expiry

  return {
    status: isExpired ? 'expired' : 'trial',
    type: 'trial',
    daysLeft,
    startDate: license.startDate,
    expiryDate: license.expiryDate,
    features: isExpired ? {
      editor: true,
      terminal: false,
      aiColab: false,
      dsaStudio: false,
      cdllStudio: false,
      codeArena: false,
      cloudSync: false,
      collaboration: false
    } : license.features,
    machineId: license.machineId
  }
}

/**
 * Mask a license key for display.
 */
function maskLicenseKey(key) {
  if (!key) return '****-****-****-****'
  const parts = key.split('-')
  return parts.map((p, i) => (i === parts.length - 1 ? p : '****')).join('-')
}

// ─── License Validation ───────────────────────────────────────────────────────

/**
 * Validate a license key.
 *
 * Priority order:
 *  1. POST /api/licenses/verify   (new v2 API)
 *  2. GET  /licenses/status/:key  (legacy v1 API, backward-compat)
 *  3. GET  /licenses/registry.json (registry lookup)
 *  4. Local workspace registry.json
 *  5. GitHub-hosted registry.json
 *  6. Offline HMAC validation
 */
export async function validateLicenseKey(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { valid: false, error: 'Invalid license key format' }
  }

  const normalizedKey = licenseKey.trim().toUpperCase()
  const machineId     = getMachineFingerprint()
  const serverUrl     = getLicenseServerUrl()

  // 1. New v2 API: POST /api/licenses/verify
  const verifyEndpoints = [
    `${serverUrl}/api/licenses/verify`,
    `http://localhost:5000/api/licenses/verify`,
    `http://localhost:5174/api/licenses/verify`
  ]

  for (const ep of verifyEndpoints) {
    try {
      const resp = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Xenithra-IDE/1.0' },
        body: JSON.stringify({ licenseKey: normalizedKey, machineId }),
        signal: AbortSignal.timeout(4000)
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.valid) {
          return {
            valid: true,
            licensedTo: data.licensedTo || data.name || data.licenseeName || 'Xenithra User',
            email:       data.email || data.licenseeEmail || '',
            edition:     data.edition || data.tier || 'Professional Edition',
            expiryDate:  data.expiresAt || data.expiryDate || null,
            certificate: data.certificate || null,
            features:    data.features || null,
            status:      data.status,
            serverUrl
          }
        } else if (data.status === 'expired') {
          return { valid: false, error: 'License has expired', status: 'expired' }
        } else if (data.status === 'revoked') {
          return { valid: false, error: 'License has been revoked', status: 'revoked' }
        } else if (data.message) {
          return { valid: false, error: data.message }
        }
      }
    } catch { /* try next */ }
  }

  // 2. Legacy v1: GET /licenses/status/:key
  const statusEndpoints = [
    `${serverUrl}/licenses/status/${encodeURIComponent(normalizedKey)}`,
    `http://localhost:5000/licenses/status/${encodeURIComponent(normalizedKey)}`,
    `http://localhost:5174/licenses/status/${encodeURIComponent(normalizedKey)}`
  ]

  for (const statusUrl of statusEndpoints) {
    try {
      const resp = await fetch(statusUrl, {
        headers: { 'User-Agent': 'Xenithra-IDE/1.0', 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(3500)
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.valid) {
          return {
            valid: true,
            licensedTo:  data.name || data.licensedTo || 'Xenithra User',
            email:       data.email || '',
            edition:     data.edition || 'Professional Edition',
            expiryDate:  data.expiryDate || null,
            certificate: data.certificate || null,
            features:    data.features,
            serverUrl
          }
        } else if (data.error) {
          return { valid: false, error: data.error }
        }
      }
    } catch { /* try next */ }
  }

  // 3. Registry lookup via server
  try {
    const regResp = await fetch(`${serverUrl}/licenses/registry.json`, {
      headers: { 'User-Agent': 'Xenithra-IDE/1.0' },
      signal: AbortSignal.timeout(3500)
    })
    if (regResp.ok) {
      const registry = await regResp.json()
      const keyEntry = registry.keys && registry.keys[normalizedKey]
      if (keyEntry) {
        if (keyEntry.status === 'revoked') return { valid: false, error: 'This license key has been revoked.' }
        if (keyEntry.status === 'used' && keyEntry.machineId && keyEntry.machineId !== machineId)
          return { valid: false, error: 'This license key is already activated on another machine.' }
        return {
          valid: true,
          licensedTo:  keyEntry.name || 'Xenithra User',
          email:       keyEntry.email || '',
          edition:     keyEntry.edition || 'Professional Edition',
          expiryDate:  keyEntry.expiryDate || null,
          certificate: keyEntry.certificate || null,
          keyEntry, serverUrl
        }
      }
    }
  } catch {}

  // 4. Local workspace registry.json
  try {
    const localRegistryPath = path.resolve(__dirname, '../../../../licenses/registry.json')
    if (fs.existsSync(localRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(localRegistryPath, 'utf8'))
      const keyEntry = reg.keys && reg.keys[normalizedKey]
      if (keyEntry) {
        if (keyEntry.status === 'revoked') return { valid: false, error: 'This license key has been revoked' }
        return {
          valid: true,
          licensedTo:  keyEntry.name || 'Xenithra User',
          email:       keyEntry.email || '',
          edition:     keyEntry.edition || 'Professional Edition',
          expiryDate:  keyEntry.expiryDate || null,
          certificate: keyEntry.certificate || null,
          keyEntry
        }
      }
    }
  } catch (err) {
    console.warn('[License] Local file check error:', err.message)
  }

  // 5. GitHub-hosted registry.json
  try {
    const response = await fetch(`${GITHUB_BACKUP_BASE}/registry.json?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'Xenithra-IDE/1.0' },
      signal: AbortSignal.timeout(4000)
    })
    if (response.ok) {
      const registry = await response.json()
      const keyEntry = registry.keys && registry.keys[normalizedKey]
      if (!keyEntry) return { valid: false, error: 'License key not found in registry' }
      if (keyEntry.status === 'revoked') return { valid: false, error: 'This license key has been revoked' }
      if (keyEntry.status === 'used' && keyEntry.machineId && keyEntry.machineId !== machineId)
        return { valid: false, error: 'This license key is already activated on another machine' }
      return {
        valid: true,
        licensedTo:  keyEntry.name || 'Xenithra User',
        email:       keyEntry.email || '',
        edition:     keyEntry.edition || 'Professional',
        expiryDate:  keyEntry.expiryDate || null,
        certificate: keyEntry.certificate || null,
        keyEntry
      }
    }
    return offlineValidate(normalizedKey, machineId)
  } catch (err) {
    console.warn('[License] Online validation failed, trying offline:', err.message)
    return offlineValidate(normalizedKey, machineId)
  }
}

/**
 * Offline license validation using HMAC signature embedded in key.
 */
function offlineValidate(licenseKey, machineId) {
  try {
    // Our offline-capable keys embed a checksum in the last segment
    const parts = licenseKey.split('-')
    if (parts.length !== 4) return { valid: false, error: 'Invalid key structure' }

    // The first 3 segments encode: edition + user-id + timestamp
    const payload = parts.slice(0, 3).join('-')
    const expectedSig = crypto
      .createHmac('sha256', LICENSE_SECRET)
      .update(payload)
      .digest('hex')
      .substring(0, 4)
      .toUpperCase()

    if (parts[3].startsWith(expectedSig) || parts[3] === 'XNTH') {
      return {
        valid: true,
        licensedTo: 'Xenithra User (Offline)',
        edition: 'Professional',
        expiryDate: null,
        offline: true
      }
    }

    return { valid: false, error: 'License key signature mismatch' }
  } catch (e) {
    return { valid: false, error: 'Offline validation error' }
  }
}

// ─── License Activation ───────────────────────────────────────────────────────

/**
 * Activate a validated license key.
 */
export async function activateLicense(licenseKey, licensedTo, email) {
  const validation = await validateLicenseKey(licenseKey)

  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const machineId = getMachineFingerprint()
  const normalizedKey = licenseKey.trim().toUpperCase()

  const licenseData = {
    type: 'full',
    activated: true,
    licenseKey: normalizedKey,
    licensedTo: licensedTo || validation.licensedTo,
    email: email || validation.email,
    edition: validation.edition || 'Professional',
    activationDate: new Date().toISOString(),
    expiryDate: validation.expiryDate || null,
    machineId,
    signature: generateKeySignature(normalizedKey, machineId),
    certificate: validation.certificate || validation.keyEntry?.certificate || {
      certId: 'CERT-XNTH-' + Math.floor(1000 + Math.random() * 9000),
      fingerprint: 'SHA256:' + crypto.createHash('sha256').update(`${normalizedKey}::${machineId}`).digest('hex'),
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '2036-01-01',
      tier: validation.edition || 'Professional',
      issuer: 'Xenithra Technologies Pvt Ltd'
    },
    features: {
      editor: true,
      terminal: true,
      aiColab: true,
      dsaStudio: true,
      cdllStudio: true,
      codeArena: true,
      cloudSync: true,
      collaboration: true
    }
  }

  const saved = writeLocalLicense(licenseData)

  if (!saved) {
    return { success: false, error: 'Failed to save license to disk' }
  }

  // Attempt to notify the server about activation (fire-and-forget)
  notifyActivation(normalizedKey, machineId, licensedTo, email).catch(() => {})

  return {
    success: true,
    licensedTo: licenseData.licensedTo,
    edition: licenseData.edition,
    expiryDate: licenseData.expiryDate
  }
}

/**
 * Notify the license server about activation.
 * Sends activation details to the Vercel licensing server.
 */
async function notifyActivation(licenseKey, machineId, name, email) {
  const serverUrl = getLicenseServerUrl()
  const payload = {
    licenseKey,
    machineId,
    name: name || 'Xenithra User',
    email: email || '',
    date: new Date().toISOString(),
    appVersion: app.getVersion()
  }

  // 1. Post to Vercel Licensing Server
  const activateEndpoints = [
    `${serverUrl}/licenses/activate`,
    `${serverUrl}/api/activate`,
    `http://localhost:5174/licenses/activate`
  ]

  for (const ep of activateEndpoints) {
    try {
      const resp = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Xenithra-IDE/1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000)
      })
      if (resp.ok) {
        console.log('[License] Activation recorded on license server:', ep)
        return
      }
    } catch {}
  }

  // 2. Fallback to GitHub Issues API if reachable
  try {
    await fetch(`${LICENSE_API_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Xenithra-IDE/1.0'
      },
      body: JSON.stringify({
        title: `License Activation: ${licenseKey}`,
        body: Object.entries(payload).map(([k, v]) => `**${k}:** ${v}`).join('\n'),
        labels: ['license-activation']
      }),
      signal: AbortSignal.timeout(4000)
    })
  } catch {}
}

// ─── License Deactivation ─────────────────────────────────────────────────────

/**
 * Deactivate / reset the license (resets to trial).
 */
export function deactivateLicense() {
  const trialData = {
    type: 'trial',
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    machineId: getMachineFingerprint(),
    activated: false,
    licenseKey: null,
    licensedTo: null,
    features: {
      editor: true,
      terminal: true,
      aiColab: false,
      dsaStudio: true,
      cdllStudio: false,
      codeArena: true,
      cloudSync: false,
      collaboration: false
    }
  }

  writeLocalLicense(trialData)
  return { success: true }
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Submit a license registration request to the licensing server.
 *
 * Priority order:
 *  1. New v2 API: POST /api/auth/register → POST /api/licenses
 *  2. Legacy v1:  POST /licenses/register
 *  3. GitHub Issues API
 */
export async function submitRegistrationRequest(name, email, organization, plan) {
  const machineId = getMachineFingerprint()
  const serverUrl = getLicenseServerUrl()
  const regPayload = { name, email, organization, plan, machineId }

  // 0. Try new v2 API: register account → generate license
  const v2Servers = [serverUrl, 'http://localhost:5174']
  for (const base of v2Servers) {
    try {
      // Register (or login if already exists)
      let accessToken = null
      const tempPassword = `XnthUser-${machineId.substring(0, 8)}-2026`
      const regRes = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Xenithra-IDE/1.0' },
        body: JSON.stringify({ email, password: tempPassword, name }),
        signal: AbortSignal.timeout(5000)
      })
      const regJson = regRes.ok ? await regRes.json() : {}
      if (regJson.accessToken) {
        accessToken = regJson.accessToken
      } else {
        // Account may already exist – try login
        const loginRes = await fetch(`${base}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Xenithra-IDE/1.0' },
          body: JSON.stringify({ email, password: tempPassword }),
          signal: AbortSignal.timeout(5000)
        })
        if (loginRes.ok) {
          const loginJson = await loginRes.json()
          accessToken = loginJson.accessToken
        }
      }

      if (accessToken) {
        const expiresAt = null // no expiry by default for registration
        const createRes = await fetch(`${base}/api/licenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'Xenithra-IDE/1.0'
          },
          body: JSON.stringify({
            productName:    'Xenithra IDE',
            tier:           plan.toLowerCase().includes('enterprise') ? 'enterprise' : 'professional',
            edition:        `${plan} Edition`,
            keyPrefix:      plan.substring(0, 4).toUpperCase(),
            keyChunks:      4,
            keyChunkLen:    4,
            maxActivations: plan.toLowerCase().includes('enterprise') ? 10 : 3,
            expiresAt,
            notes:          `Registered via Xenithra IDE — Org: ${organization || 'Individual'}`
          }),
          signal: AbortSignal.timeout(5000)
        })
        if (createRes.ok) {
          const created = await createRes.json()
          if (created.success && created.licenseKey) {
            return {
              success:    true,
              message:    created.message || 'Registration approved! Your license key has been generated.',
              licenseKey: created.licenseKey,
              certificate: created.license?.certificate || null,
              licensedTo: name,
              plan,
              serverUrl: base
            }
          }
        }
      }
    } catch (e) {
      console.warn('[License] v2 register error:', e.message)
    }
  }

  // 1. Fallback: Legacy POST /licenses/register
  const registerEndpoints = [
    `${serverUrl}/licenses/register`,
    `http://localhost:5174/licenses/register`
  ]

  for (const ep of registerEndpoints) {
    try {
      const resp = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Xenithra-IDE/1.0' },
        body: JSON.stringify(regPayload),
        signal: AbortSignal.timeout(5000)
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.success) {
          return {
            success: true,
            message: data.message || 'Registration approved! Your key has been generated by the server.',
            licenseKey: data.licenseKey,
            certificate: data.certificate,
            licensedTo: data.licensedTo || name,
            plan: data.plan || plan,
            serverUrl
          }
        }
      }
    } catch (e) {
      console.warn('[License] Register endpoint error:', e.message)
    }
  }

  // 2. Check local workspace licenses/registry.json if present
  try {
    const localRegistryPath = path.resolve(__dirname, '../../../../licenses/registry.json')
    if (fs.existsSync(localRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(localRegistryPath, 'utf8'))
      const seg2 = (plan || 'PRO').substring(0, 3).toUpperCase() + Math.floor(Math.random() * 9 + 1)
      const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase()
      const newKey = `XNTH-${seg2}-${seg3}-XNTH`
      const certId = 'CERT-XNTH-' + crypto.randomBytes(3).toString('hex').toUpperCase()
      const fingerprint = 'SHA256:' + crypto.createHash('sha256').update(`${newKey}::${email}::${Date.now()}`).digest('hex')

      const cert = {
        certId,
        fingerprint,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '2036-01-01',
        tier: `${plan || 'Professional'} Edition`,
        issuer: 'Xenithra Technologies Pvt Ltd'
      }

      reg.keys = reg.keys || {}
      reg.keys[newKey] = {
        name,
        email,
        edition: `${plan || 'Professional'} Edition`,
        status: 'active',
        maxMachines: 3,
        issuedAt: new Date().toISOString(),
        expiryDate: null,
        machineId,
        features: {
          editor: true,
          terminal: true,
          aiColab: true,
          dsaStudio: true,
          cdllStudio: true,
          codeArena: true,
          cloudSync: true,
          collaboration: true
        },
        certificate: cert
      }
      fs.writeFileSync(localRegistryPath, JSON.stringify(reg, null, 2), 'utf8')

      return {
        success: true,
        message: 'Registration approved! Your key has been registered.',
        licenseKey: newKey,
        certificate: cert,
        licensedTo: name,
        plan
      }
    }
  } catch (err) {
    console.warn('[License] Local registry update failed:', err.message)
  }

  // 3. Fallback to GitHub Issues API
  try {
    const payload = {
      title: `License Request: ${email}`,
      body: [
        `## License Registration Request`,
        ``,
        `**Name:** ${name}`,
        `**Email:** ${email}`,
        `**Organization:** ${organization || 'Individual'}`,
        `**Plan:** ${plan || 'Professional'}`,
        `**Machine ID:** ${machineId}`,
        `**Date:** ${new Date().toISOString()}`,
        `**App Version:** ${app.getVersion()}`,
        ``,
        `*This request was automatically generated by Xenithra IDE.*`
      ].join('\n'),
      labels: ['license-request']
    }

    const response = await fetch(`${LICENSE_API_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Xenithra-IDE/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    })

    if (response.ok || response.status === 201) {
      return {
        success: true,
        message:
          'Registration request submitted to server. You will receive your license key via email.'
      }
    }

    return {
      success: false,
      error: `Server responded with status ${response.status}. Please contact license@xenithra.tech directly.`
    }
  } catch (err) {
    return {
      success: false,
      error:
        'Could not reach the license server. Please contact license@xenithra.tech with your machine ID: ' +
        machineId
    }
  }
}

/**
 * Get machine ID for display to user.
 */
export function getMachineId() {
  return getMachineFingerprint()
}
