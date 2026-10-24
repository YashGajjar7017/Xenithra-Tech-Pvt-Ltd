/**
 * Xenithra Licensing Backend Server  v2.0
 *
 * Implements the documented API contract:
 *   POST   /api/auth/login           - get JWT access token
 *   POST   /api/auth/register        - create account
 *   POST   /api/licenses             - generate license (auth required)
 *   GET    /api/licenses             - list licenses   (auth required)
 *   GET    /api/licenses/:id/reveal  - reveal raw key  (auth required)
 *   POST   /api/licenses/verify      - verify a key    (public)
 *
 * Legacy endpoints (backward-compat with Electron client v1):
 *   GET    /health, /
 *   GET    /licenses/registry.json
 *   GET    /licenses/status/:key
 *   POST   /licenses/register
 *   POST   /licenses/activate
 *
 * Storage: In-memory + flat JSON files.
 * Works on Vercel (ephemeral /tmp) and local Node.js.
 *
 * Env vars (Vercel Project Settings > Environment Variables):
 *   JWT_ACCESS_SECRET   - secret for signing JWTs
 *   HMAC_SECRET         - HMAC secret for license key generation
 *   ENCRYPTION_KEY      - 32-char AES-256 key
 *   ADMIN_EMAIL         - default admin email
 *   ADMIN_PASSWORD      - default admin password
 */

'use strict'

const http   = require('http')
const fs     = require('fs')
const path   = require('path')
const crypto = require('crypto')

// Config
const PORT           = process.env.LICENSE_SERVER_PORT || 5174
const JWT_SECRET     = process.env.JWT_ACCESS_SECRET  || 'XENITHRA_DEV_JWT_SECRET_2026'
const HMAC_SECRET    = process.env.HMAC_SECRET        || 'XENITHRA_HMAC_SECRET_2026'
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY    || 'XenithraEncKey32CharsPadded00000').substring(0, 32)
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL        || 'admin@xenithra.tech'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD     || 'xenithra-admin-2026'

// Persistent storage
const IS_VERCEL    = !!(process.env.VERCEL || process.env.NOW_REGION)
const TMP_DIR      = IS_VERCEL ? '/tmp' : __dirname
const REGISTRY_PATH    = path.join(__dirname, 'registry.json')
const USERS_PATH       = path.join(TMP_DIR, 'xenithra_users.json')
const LICENSES_DB_PATH = path.join(TMP_DIR, 'xenithra_licenses_db.json')

let _users = null; let _licenses = null; let _registry = null

function readJSON(p, fb) { try { if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')) } catch {} return fb }
function writeJSON(p, d) {
  try { fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8'); return true } catch {}
  try { fs.writeFileSync(path.join('/tmp', path.basename(p)), JSON.stringify(d, null, 2), 'utf8'); return true } catch {}
  return false
}

function getUsers() {
  if (!_users) {
    _users = readJSON(USERS_PATH, { users: [] })
    if (!_users.users || !_users.users.length) {
      _users.users = [{ id: 'USR-' + crypto.randomBytes(4).toString('hex').toUpperCase(), email: ADMIN_EMAIL,
        passwordHash: hashPw(ADMIN_PASSWORD), role: 'admin', createdAt: new Date().toISOString() }]
      writeJSON(USERS_PATH, _users)
    }
  }
  return _users
}
function saveUsers()    { writeJSON(USERS_PATH, _users) }
function getLicensesDB(){ if (!_licenses) _licenses = readJSON(LICENSES_DB_PATH, { licenses: [] }); return _licenses }
function saveLicensesDB(){ writeJSON(LICENSES_DB_PATH, _licenses) }
function getRegistry()  { if (!_registry) _registry = readJSON(REGISTRY_PATH, { keys: {} }); return _registry }
function saveRegistry() { writeJSON(REGISTRY_PATH, _registry) }

// Crypto helpers
function hashPw(pw)       { return crypto.createHmac('sha256', HMAC_SECRET).update(pw).digest('hex') }
function genId(p='LIC')   { return `${p}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}` }

function encryptKey(txt) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  const enc = Buffer.concat([cipher.update(txt, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + enc.toString('hex')
}

function decryptKey(ct) {
  try {
    const [ivH, encH] = ct.split(':')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), Buffer.from(ivH, 'hex'))
    return Buffer.concat([decipher.update(Buffer.from(encH, 'hex')), decipher.final()]).toString('utf8')
  } catch { return null }
}

function genLicKey(prefix='XNTH', chunks=4, chunkLen=4) {
  const parts = [(prefix || 'XNTH').toUpperCase().substring(0, 8)]
  for (let i = 1; i < chunks; i++) parts.push(crypto.randomBytes(Math.ceil(chunkLen / 2)).toString('hex').toUpperCase().substring(0, chunkLen))
  return parts.join('-')
}

function genCert(key, name, email, tier) {
  const certId = 'CERT-XNTH-' + crypto.randomBytes(4).toString('hex').toUpperCase()
  const fingerprint = 'SHA256:' + crypto.createHash('sha256').update(`${key}::${name}::${email}::${Date.now()}`).digest('hex')
  const now = new Date()
  return { certId, fingerprint, validFrom: now.toISOString().split('T')[0],
    validTo: new Date(now.getTime() + 365 * 86400000).toISOString().split('T')[0],
    tier: tier || 'Professional', issuer: 'Xenithra Technologies Pvt Ltd' }
}

// Minimal JWT (no deps)
function b64url(s) { return Buffer.from(s).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'') }
function signJWT(payload, exp=86400) {
  const h = b64url(JSON.stringify({ alg:'HS256', typ:'JWT' }))
  const p = b64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+exp }))
  const s = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url')
  return `${h}.${p}.${s}`
}
function verifyJWT(token) {
  try {
    const [h,p,s] = token.split('.')
    if (s !== crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url')) return null
    const pl = JSON.parse(Buffer.from(p, 'base64url').toString())
    if (pl.exp && pl.exp < Math.floor(Date.now()/1000)) return null
    return pl
  } catch { return null }
}
function extractBearer(req) { const a = (req.headers.authorization||''); return a.startsWith('Bearer ') ? a.slice(7).trim() : null }
function requireAuth(req) {
  const token = extractBearer(req); if (!token) return null
  const pl = verifyJWT(token); if (!pl) return null
  return getUsers().users.find(u => u.id === pl.sub) || null
}

// Body reader
function readBody(req) {
  return new Promise((res, rej) => {
    let b = ''; req.on('data', c => { b += c }); req.on('end', () => { try { res(b ? JSON.parse(b) : {}) } catch(e) { rej(new Error('Invalid JSON')) } }); req.on('error', rej)
  })
}
function send(res, status, data) { res.writeHead(status, { 'Content-Type':'application/json' }); res.end(JSON.stringify(data)) }

function maskKey(k) {
  if (!k) return '****-****-****-****'
  const p = k.split('-'); return p.map((s,i) => (i===0||i===p.length-1) ? s : '****').join('-')
}
function defaultFeatures() {
  return { editor:true, terminal:true, aiColab:true, dsaStudio:true, cdllStudio:true, codeArena:true, cloudSync:true, collaboration:true }
}

// Main handler
const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  const url      = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  const method   = req.method.toUpperCase()
  console.log(`[LicenseServer] ${method} ${pathname}`)

  try {
    // Health
    if (method==='GET' && (pathname==='/'||pathname==='/health'||pathname==='/api/health')) {
      return send(res, 200, { status:'online', service:'Xenithra Licensing Server', version:'2.0.0', uptime: process.uptime() })
    }

    // POST /api/auth/register
    if (method==='POST' && (pathname==='/api/auth/register'||pathname==='/api/register')) {
      const { email, password, name } = await readBody(req)
      if (!email||!password) return send(res, 400, { success:false, message:'email and password required' })
      const db = getUsers()
      if (db.users.find(u => u.email===email.toLowerCase().trim()))
        return send(res, 409, { success:false, message:'Email already registered' })
      const user = { id: genId('USR'), email: email.toLowerCase().trim(), name: name||email.split('@')[0],
        passwordHash: hashPw(password), role:'user', createdAt: new Date().toISOString() }
      db.users.push(user); saveUsers()
      const accessToken = signJWT({ sub:user.id, email:user.email, role:user.role })
      return send(res, 201, { success:true, accessToken, user:{ id:user.id, email:user.email, name:user.name, role:user.role } })
    }

    // POST /api/auth/login
    if (method==='POST' && (pathname==='/api/auth/login'||pathname==='/api/login')) {
      const { email, password } = await readBody(req)
      if (!email||!password) return send(res, 400, { success:false, message:'email and password required' })
      const db = getUsers()
      const user = db.users.find(u => u.email===email.toLowerCase().trim())
      if (!user||user.passwordHash!==hashPw(password)) return send(res, 401, { success:false, message:'Invalid email or password' })
      const accessToken = signJWT({ sub:user.id, email:user.email, role:user.role })
      return send(res, 200, { success:true, accessToken, user:{ id:user.id, email:user.email, name:user.name||user.email, role:user.role } })
    }

    // POST /api/licenses/verify  (PUBLIC)
    if (method==='POST' && (pathname==='/api/licenses/verify'||pathname==='/api/verify')) {
      const { licenseKey, machineId } = await readBody(req)
      if (!licenseKey) return send(res, 400, { success:false, valid:false, message:'licenseKey is required' })
      const key = licenseKey.trim().toUpperCase()
      const db  = getLicensesDB(); const reg = getRegistry()

      const lic = db.licenses.find(l => l.rawKey===key)
      if (lic) {
        if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) {
          if (lic.status!=='expired') { lic.status='expired'; saveLicensesDB() }
          return send(res, 200, { success:false, valid:false, status:'expired', message:'License has expired', expiresAt:lic.expiresAt })
        }
        if (lic.status==='revoked') return send(res, 200, { success:false, valid:false, status:'revoked', message:'License has been revoked' })
        let machineStatus='unbound'
        if (machineId) {
          lic.machineIds = lic.machineIds||[]
          if (!lic.machineIds.length) { lic.machineIds.push(machineId); saveLicensesDB(); machineStatus='bound' }
          else if (lic.machineIds.includes(machineId)) { machineStatus='bound' }
          else if (lic.machineIds.length < (lic.maxActivations||1)) { lic.machineIds.push(machineId); saveLicensesDB(); machineStatus='bound' }
          else { machineStatus='exceeded' }
        }
        return send(res, 200, { success:true, valid:true, productName:lic.productName, tier:lic.tier||'basic', status:lic.status,
          expiresAt:lic.expiresAt, features:lic.features||defaultFeatures(), edition:lic.edition, licensedTo:lic.licensedTo,
          certificate:lic.certificate, machineStatus })
      }

      const entry = reg.keys && reg.keys[key]
      if (entry) {
        if (entry.status==='revoked') return send(res, 200, { success:false, valid:false, status:'revoked', message:'License has been revoked' })
        if (entry.expiryDate && new Date(entry.expiryDate) < new Date())
          return send(res, 200, { success:false, valid:false, status:'expired', message:'License has expired', expiresAt:entry.expiryDate })
        if (machineId && !entry.machineId) { entry.machineId=machineId; saveRegistry() }
        return send(res, 200, { success:true, valid:entry.status==='active', productName:'Xenithra IDE',
          tier:(entry.edition||'').toLowerCase().includes('enterprise')?'enterprise':'professional',
          status:entry.status, expiresAt:entry.expiryDate||null, features:entry.features||defaultFeatures(),
          edition:entry.edition, licensedTo:entry.name, certificate:entry.certificate,
          machineStatus: machineId ? (entry.machineId===machineId?'bound':'exceeded') : 'unbound' })
      }
      return send(res, 200, { success:false, valid:false, status:'not_found', message:'License key not found' })
    }

    // POST /api/licenses  (AUTH)
    if (method==='POST' && pathname==='/api/licenses') {
      const user = requireAuth(req)
      if (!user) return send(res, 401, { success:false, message:'Authentication required' })
      const { productName='Xenithra IDE', tier='basic', keyPrefix='XNTH', keyChunks=4, keyChunkLen=4,
        maxActivations=1, expiresAt=null, notes='', edition=null, licenseKey=null, customKey=null } = await readBody(req)
      const rawKey = (licenseKey || customKey || genLicKey(keyPrefix, keyChunks, keyChunkLen)).trim().toUpperCase()
      const cert   = genCert(rawKey, user.name||user.email, user.email, tier)
      const id     = genId('LIC')
      const record = {
        id, productName, tier, edition: edition||`${tier.charAt(0).toUpperCase()+tier.slice(1)} Edition`,
        status:'active', maxActivations, expiresAt: expiresAt||null, notes,
        issuedBy:user.id, issuedAt:new Date().toISOString(), licensedTo:user.name||user.email,
        email:user.email, encryptedKey:encryptKey(rawKey), rawKey, machineIds:[], certificate:cert, features:defaultFeatures()
      }
      const db = getLicensesDB(); db.licenses.push(record); saveLicensesDB()
      const reg = getRegistry(); reg.keys = reg.keys||{}
      reg.keys[rawKey] = { name:record.licensedTo, email:record.email, edition:record.edition, status:'active',
        maxMachines:maxActivations, issuedAt:record.issuedAt, expiryDate:expiresAt, machineId:null,
        features:record.features, certificate:cert }
      saveRegistry()
      return send(res, 201, { success:true, message:"License created. Copy this key now — it cannot be shown again.",
        licenseKey:rawKey, license:{ id, productName, tier, status:'active', maxActivations, expiresAt: expiresAt||null, issuedAt:record.issuedAt } })
    }

    // GET /api/licenses  (AUTH)
    if (method==='GET' && pathname==='/api/licenses') {
      const user = requireAuth(req)
      if (!user) return send(res, 401, { success:false, message:'Authentication required' })
      const statusFilter = url.searchParams.get('status')
      const db = getLicensesDB()
      let lics = user.role==='admin' ? db.licenses : db.licenses.filter(l => l.issuedBy===user.id)
      if (statusFilter) lics = lics.filter(l => l.status===statusFilter)
      return send(res, 200, { success:true, licenses: lics.map(l => ({
        id:l.id, productName:l.productName, tier:l.tier, edition:l.edition, status:l.status,
        maxActivations:l.maxActivations, activations:(l.machineIds||[]).length, expiresAt:l.expiresAt,
        issuedAt:l.issuedAt, licensedTo:l.licensedTo, notes:l.notes, maskedKey:maskKey(l.rawKey) })) })
    }

    // GET /api/licenses/:id/reveal  (AUTH)
    if (method==='GET' && /^\/api\/licenses\/[^/]+\/reveal$/.test(pathname)) {
      const user = requireAuth(req)
      if (!user) return send(res, 401, { success:false, message:'Authentication required' })
      const id = pathname.split('/')[3]
      const db = getLicensesDB(); const lic = db.licenses.find(l => l.id===id)
      if (!lic) return send(res, 404, { success:false, message:'License not found' })
      if (user.role!=='admin' && lic.issuedBy!==user.id) return send(res, 403, { success:false, message:'Forbidden' })
      return send(res, 200, { success:true, licenseKey:lic.rawKey||decryptKey(lic.encryptedKey), id:lic.id,
        productName:lic.productName, status:lic.status })
    }

    // === LEGACY ENDPOINTS ===

    // GET /licenses/registry.json
    if (method==='GET' && pathname==='/licenses/registry.json') {
      return send(res, 200, getRegistry())
    }

    // GET /licenses/status/:key
    if (method==='GET' && pathname.startsWith('/licenses/status/')) {
      const key  = decodeURIComponent(pathname.replace('/licenses/status/', '')).trim().toUpperCase()
      const db   = getLicensesDB(); const reg = getRegistry()
      const lic  = db.licenses.find(l => l.rawKey===key)
      if (lic) {
        if (lic.expiresAt && new Date(lic.expiresAt) < new Date()) {
          if (lic.status!=='expired') { lic.status='expired'; saveLicensesDB() }
          return send(res, 200, { valid:false, status:'expired', error:'License has expired' })
        }
        return send(res, 200, { valid:lic.status==='active', licenseKey:key, name:lic.licensedTo, email:lic.email,
          edition:lic.edition, status:lic.status, expiryDate:lic.expiresAt, features:lic.features, certificate:lic.certificate })
      }
      const entry = reg.keys && reg.keys[key]
      if (!entry) return send(res, 404, { valid:false, error:'License key not found' })
      return send(res, 200, { valid:entry.status==='active', licenseKey:key, name:entry.name, email:entry.email,
        edition:entry.edition, status:entry.status, expiryDate:entry.expiryDate, features:entry.features, certificate:entry.certificate })
    }

    // POST /licenses/register
    if (method==='POST' && (pathname==='/licenses/register'||pathname==='/api/register')) {
      const { name, email, organization, plan='Professional', machineId } = await readBody(req)
      if (!name||!email) return send(res, 400, { success:false, error:'Name and email are required.' })
      const tier   = plan.toLowerCase().includes('enterprise') ? 'enterprise' : 'professional'
      const rawKey = genLicKey(plan.substring(0,4).toUpperCase(), 4, 4)
      const cert   = genCert(rawKey, name, email, plan)
      const id     = genId('LIC')
      const maxM   = plan.toLowerCase().includes('enterprise') ? 10 : 3
      const db = getLicensesDB()
      db.licenses.push({ id, productName:'Xenithra IDE', tier, edition:`${plan} Edition`, status:'active', maxActivations:maxM,
        expiresAt:null, issuedBy:'legacy', issuedAt:new Date().toISOString(), licensedTo:name, email,
        rawKey, encryptedKey:encryptKey(rawKey), machineIds:machineId?[machineId]:[], certificate:cert, features:defaultFeatures() })
      saveLicensesDB()
      const reg = getRegistry(); reg.keys = reg.keys||{}
      reg.keys[rawKey] = { name, email, edition:`${plan} Edition`, status:'active', maxMachines:maxM,
        issuedAt:new Date().toISOString(), expiryDate:null, machineId:machineId||null,
        features:defaultFeatures(), certificate:cert }
      saveRegistry()
      return send(res, 201, { success:true, message:'Registration approved! Your license key and certificate have been generated.',
        licenseKey:rawKey, certificate:cert, licensedTo:name, plan })
    }

    // POST /licenses/activate
    if (method==='POST' && (pathname==='/licenses/activate'||pathname==='/api/activate')) {
      const { licenseKey, machineId, name } = await readBody(req)
      if (!licenseKey) return send(res, 400, { success:false, error:'License key is required.' })
      const key = licenseKey.trim().toUpperCase()
      const db  = getLicensesDB(); const reg = getRegistry()
      const lic = db.licenses.find(l => l.rawKey===key)
      if (lic) {
        if (lic.status!=='active') return send(res, 403, { success:false, error:`License is ${lic.status}` })
        lic.machineIds = lic.machineIds||[]
        if (machineId && !lic.machineIds.includes(machineId)) {
          if (lic.machineIds.length < (lic.maxActivations||1)) { lic.machineIds.push(machineId); saveLicensesDB() }
          else return send(res, 403, { success:false, error:'Max activations reached.' })
        }
        return send(res, 200, { success:true, message:'License activated successfully!', licenseKey:key,
          licensedTo:lic.licensedTo||name, edition:lic.edition, expiryDate:lic.expiresAt,
          features:lic.features, certificate:lic.certificate })
      }
      const entry = reg.keys && reg.keys[key]
      if (!entry) return send(res, 404, { success:false, error:'License key not found in registry.' })
      if (entry.status!=='active') return send(res, 403, { success:false, error:`License is ${entry.status}` })
      if (!entry.machineId && machineId) { entry.machineId=machineId; saveRegistry() }
      return send(res, 200, { success:true, message:'License activated successfully!', licenseKey:key,
        licensedTo:entry.name||name, edition:entry.edition, expiryDate:entry.expiryDate,
        features:entry.features, certificate:entry.certificate })
    }

    return send(res, 404, { error:'Endpoint not found', path:pathname })
  } catch (err) {
    console.error('[LicenseServer] Error:', err.message)
    return send(res, 500, { error:'Internal server error', message:err.message })
  }
}

const server = http.createServer(handler)

if (require.main === module || (!process.env.VERCEL && !process.env.NOW_REGION)) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[LicenseServer] Xenithra Licensing Server v2.0 listening on http://localhost:${PORT}`)
    console.log(`[LicenseServer] Admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  })
}

module.exports         = handler
module.exports.handler = handler
module.exports.default = handler
module.exports.server  = server
