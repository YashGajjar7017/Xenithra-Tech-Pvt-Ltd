/**
 * Xenithra Licensing Backend Server
 * 
 * Standalone licensing microserver that handles:
 * - License key fetch and validation
 * - License registration request processing & key generation
 * - Digital certificate generation and verification
 * - Machine binding & activation tracking
 * 
 * Runs on standard Node.js without third-party dependencies.
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const PORT = process.env.LICENSE_SERVER_PORT || 5174
const REGISTRY_PATH = path.join(__dirname, 'registry.json')
const REGISTRATIONS_PATH = path.join(__dirname, 'registrations.json')

// Helper to read registry
function getRegistry() {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
    }
  } catch (err) {
    console.error('[LicenseServer] Error reading registry:', err.message)
  }
  return { keys: {} }
}

// Helper to save registry
function saveRegistry(data) {
  try {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('[LicenseServer] Error saving registry:', err.message)
    return false
  }
}

// Helper to get registrations
function getRegistrations() {
  try {
    if (fs.existsSync(REGISTRATIONS_PATH)) {
      return JSON.parse(fs.readFileSync(REGISTRATIONS_PATH, 'utf8'))
    }
  } catch (err) {}
  return []
}

// Helper to save registration
function saveRegistration(reg) {
  try {
    const list = getRegistrations()
    list.push(reg)
    fs.writeFileSync(REGISTRATIONS_PATH, JSON.stringify(list, null, 2), 'utf8')
    return true
  } catch (err) {
    return false
  }
}

// Generate standard Xenithra license key: XNTH-XXXX-XXXX-XNTH
function generateLicenseKey(prefix = 'PRO') {
  const seg1 = 'XNTH'
  const seg2 = prefix.padEnd(3, '0').substring(0, 3) + Math.floor(Math.random() * 9 + 1)
  const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase()
  const seg4 = 'XNTH'
  return `${seg1}-${seg2}-${seg3}-${seg4}`
}

// Generate digital certificate for license
function generateCertificate(key, name, email, tier) {
  const certId = 'CERT-XNTH-' + crypto.randomBytes(4).toString('hex').toUpperCase()
  const fingerprint = 'SHA256:' + crypto.createHash('sha256').update(`${key}::${name}::${email}::${Date.now()}`).digest('hex')
  const validFrom = new Date().toISOString().split('T')[0]
  const validTo = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return {
    certId,
    fingerprint,
    validFrom,
    validTo,
    tier: tier || 'Professional',
    issuer: 'Xenithra Technologies Pvt Ltd'
  }
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname

  console.log(`[LicenseServer] ${req.method} ${pathname}`)

  // 1. Health & Ping
  if (req.method === 'GET' && (pathname === '/' || pathname === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'online',
      service: 'Xenithra Licensing Server',
      version: '1.0.0',
      uptime: process.uptime()
    }))
    return
  }

  // 2. Fetch Registry directly
  if (req.method === 'GET' && pathname === '/licenses/registry.json') {
    const registry = getRegistry()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(registry, null, 2))
    return
  }

  // 3. Query License Key Status
  if (req.method === 'GET' && pathname.startsWith('/licenses/status/')) {
    const key = decodeURIComponent(pathname.replace('/licenses/status/', '')).trim().toUpperCase()
    const registry = getRegistry()
    const entry = registry.keys && registry.keys[key]

    if (!entry) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ valid: false, error: 'License key not found' }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      valid: entry.status === 'active',
      licenseKey: key,
      name: entry.name,
      email: entry.email,
      edition: entry.edition,
      status: entry.status,
      expiryDate: entry.expiryDate,
      features: entry.features,
      certificate: entry.certificate
    }))
    return
  }

  // 4. Handle Registration Request (POST /licenses/register)
  if (req.method === 'POST' && (pathname === '/licenses/register' || pathname === '/api/register')) {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}')
        const { name, email, organization, plan = 'Professional', machineId } = payload

        if (!name || !email) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: 'Name and email are required.' }))
          return
        }

        // Auto-generate key and certificate
        const newKey = generateLicenseKey(plan.substring(0, 3).toUpperCase())
        const certificate = generateCertificate(newKey, name, email, plan)

        const registry = getRegistry()
        registry.keys[newKey] = {
          name,
          email,
          edition: `${plan} Edition`,
          status: 'active',
          maxMachines: plan.toLowerCase().includes('enterprise') ? 10 : 3,
          issuedAt: new Date().toISOString(),
          expiryDate: null,
          machineId: machineId || null,
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
          certificate
        }

        saveRegistry(registry)

        // Save registration record
        saveRegistration({
          id: 'REG-' + Date.now(),
          name,
          email,
          organization,
          plan,
          machineId,
          issuedKey: newKey,
          registeredAt: new Date().toISOString()
        })

        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          success: true,
          message: 'Registration approved! Your license key and certificate have been generated.',
          licenseKey: newKey,
          certificate,
          licensedTo: name,
          plan
        }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: err.message }))
      }
    })
    return
  }

  // 5. Activate License (POST /licenses/activate)
  if (req.method === 'POST' && pathname === '/licenses/activate') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}')
        const { licenseKey, machineId, name, email } = payload

        if (!licenseKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: 'License key is required.' }))
          return
        }

        const normalizedKey = licenseKey.trim().toUpperCase()
        const registry = getRegistry()
        const entry = registry.keys && registry.keys[normalizedKey]

        if (!entry) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: 'License key not found in registry.' }))
          return
        }

        if (entry.status !== 'active') {
          res.writeHead(403, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: `License key is ${entry.status}.` }))
          return
        }

        // Bind machine ID
        if (!entry.machineId) {
          entry.machineId = machineId
          saveRegistry(registry)
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          success: true,
          message: 'License activated successfully!',
          licenseKey: normalizedKey,
          licensedTo: entry.name || name,
          edition: entry.edition,
          expiryDate: entry.expiryDate,
          features: entry.features,
          certificate: entry.certificate
        }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: err.message }))
      }
    })
    return
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Endpoint not found' }))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[LicenseServer] Xenithra Licensing Server listening on http://localhost:${PORT}`)
})

module.exports = server
