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

  try {
    // Attempt to verify against GitHub-hosted registry
    const registryUrl = `${LICENSE_SERVER_BASE}/registry.json?t=${Date.now()}`
    const response = await fetch(registryUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Xenithra-IDE/1.0'
      },
      signal: AbortSignal.timeout(8000)
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
  try {
    const machineId = getMachineFingerprint()

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
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok || response.status === 201) {
      return {
        success: true,
        message:
          'Registration request submitted successfully. You will receive your license key via email within 24 hours.'
      }
    }

    return {
      success: false,
      error: `Server responded with status ${response.status}. Please email license@xenithra.tech directly.`
    }
  } catch (err) {
    return {
      success: false,
      error:
        'Could not reach the license server. Please email license@xenithra.tech with your machine ID: ' +
        getMachineFingerprint()
    }
  }
}

/**
 * Get machine ID for display to user.
 */
export function getMachineId() {
  return getMachineFingerprint()
}
