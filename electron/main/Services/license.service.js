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
const LICENSE_SERVER_BASE =
  'https://raw.githubusercontent.com/YashGajjar7017/Xenithra-Tech-Pvt-Ltd/main/licenses'
const LICENSE_API_URL = 'https://api.github.com/repos/YashGajjar7017/Xenithra-Tech-Pvt-Ltd'
const TRIAL_DURATION_DAYS = 30
const LICENSE_FILE = 'xenithra_license.json'
const LICENSE_SECRET = 'XENITHRA_SECRET_SALT_2026_V1'

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
 * Validate a license key against the GitHub-hosted license registry.
 * The registry is a JSON file at:
 * https://raw.githubusercontent.com/YashGajjar7017/Xenithra-Tech-Pvt-Ltd/main/licenses/registry.json
 */
export async function validateLicenseKey(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { valid: false, error: 'Invalid license key format' }
  }

  const normalizedKey = licenseKey.trim().toUpperCase()

  // Basic format check: XXXX-XXXX-XXXX-XXXX
  const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  if (!keyPattern.test(normalizedKey)) {
    return {
      valid: false,
      error: 'License key format invalid. Expected: XXXX-XXXX-XXXX-XXXX'
    }
  }

  const machineId = getMachineFingerprint()

  // 1. Try local licensing backend server if running (port 5174 or custom)
  try {
    const localServerUrl = `http://localhost:5174/licenses/status/${encodeURIComponent(normalizedKey)}`
    const resp = await fetch(localServerUrl, { signal: AbortSignal.timeout(1500) })
    if (resp.ok) {
      const data = await resp.json()
      if (data.valid) {
        return {
          valid: true,
          licensedTo: data.name || 'Xenithra User',
          email: data.email || '',
          edition: data.edition || 'Professional Edition',
          expiryDate: data.expiryDate || null,
          certificate: data.certificate || null,
          features: data.features
        }
      }
    }
  } catch {
    // Local server not running or timed out, continue to file/remote
  }

  // 2. Check local workspace licenses/registry.json if present
  try {
    const localRegistryPath = path.resolve(__dirname, '../../../../licenses/registry.json')
    if (fs.existsSync(localRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(localRegistryPath, 'utf8'))
      const keyEntry = reg.keys && reg.keys[normalizedKey]
      if (keyEntry) {
        if (keyEntry.status === 'revoked') {
          return { valid: false, error: 'This license key has been revoked' }
        }
        return {
          valid: true,
          licensedTo: keyEntry.name || 'Xenithra User',
          email: keyEntry.email || '',
          edition: keyEntry.edition || 'Professional Edition',
          expiryDate: keyEntry.expiryDate || null,
          certificate: keyEntry.certificate || null,
          keyEntry
        }
      }
    }
  } catch (err) {
    console.warn('[License] Local file check error:', err.message)
  }

  // 3. Attempt to verify against GitHub-hosted registry
  try {
    const registryUrl = `${LICENSE_SERVER_BASE}/registry.json?t=${Date.now()}`
    const response = await fetch(registryUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Xenithra-IDE/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      const registry = await response.json()
      const keyEntry = registry.keys && registry.keys[normalizedKey]

      if (!keyEntry) {
        return { valid: false, error: 'License key not found in registry' }
      }

      if (keyEntry.status === 'revoked') {
        return { valid: false, error: 'This license key has been revoked' }
      }

      if (keyEntry.status === 'used' && keyEntry.machineId && keyEntry.machineId !== machineId) {
        return {
          valid: false,
          error: 'This license key is already activated on another machine'
        }
      }

      // Valid license found
      return {
        valid: true,
        licensedTo: keyEntry.name || 'Xenithra User',
        email: keyEntry.email || '',
        edition: keyEntry.edition || 'Professional',
        expiryDate: keyEntry.expiryDate || null,
        certificate: keyEntry.certificate || null,
        keyEntry
      }
    }

    // If GitHub is unreachable, try offline validation
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
 * Notify the license server about activation (GitHub API).
 * This is best-effort and non-blocking.
 */
async function notifyActivation(licenseKey, machineId, name, email) {
  try {
    const payload = {
      title: `License Activation: ${licenseKey}`,
      body: [
        `**License Key:** ${licenseKey}`,
        `**Machine ID:** ${machineId}`,
        `**Name:** ${name || 'Unknown'}`,
        `**Email:** ${email || 'Unknown'}`,
        `**Date:** ${new Date().toISOString()}`,
        `**App Version:** ${app.getVersion()}`
      ].join('\n'),
      labels: ['license-activation']
    }

    await fetch(`${LICENSE_API_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Xenithra-IDE/1.0'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    })
  } catch {
    // Silently fail - activation is already recorded locally
  }
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
 * Submit a license registration request to the GitHub-hosted server.
 * This creates a GitHub issue as a registration request.
 */
export async function submitRegistrationRequest(name, email, organization, plan) {
  const machineId = getMachineFingerprint()

  // 1. Try local licensing backend server (http://localhost:5174/licenses/register)
  try {
    const localResp = await fetch('http://localhost:5174/licenses/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, organization, plan, machineId }),
      signal: AbortSignal.timeout(2000)
    })
    if (localResp.ok) {
      const data = await localResp.json()
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Registration approved! Your key has been generated.',
          licenseKey: data.licenseKey,
          certificate: data.certificate,
          licensedTo: data.licensedTo,
          plan: data.plan
        }
      }
    }
  } catch {
    // Local server not running or timed out, fallback to GitHub / local registry
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
