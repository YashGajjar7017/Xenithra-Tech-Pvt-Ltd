import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../temp/firebase_db.json')

// Ensure temp directory exists
const ensureDbFile = () => {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      config: {
        projectId: 'xenithra-app-1002',
        apiKey: 'AIzaSyA1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P',
        connected: false
      },
      users: [
        {
          uid: 'usr_0918',
          email: 'lead@xenithra.com',
          created: '2026-07-10',
          lastLogin: '2026-07-22'
        },
        {
          uid: 'usr_8471',
          email: 'yash@xenithra.tech',
          created: '2026-07-12',
          lastLogin: '2026-07-21'
        },
        {
          uid: 'usr_3920',
          email: 'guest@google.com',
          created: '2026-07-18',
          lastLogin: '2026-07-18'
        }
      ],
      collections: {
        users: [
          {
            id: 'usr_0918',
            data: { username: 'admin', role: 'Administrator', theme: 'vscode-dark' }
          },
          {
            id: 'usr_8471',
            data: { username: 'yash_gajjar', role: 'Lead Developer', theme: 'glass-dark' }
          }
        ],
        settings: [
          { id: 'editor_config', data: { tabSize: 4, autoSave: true, wordWrap: 'on' } },
          { id: 'network_config', data: { bindHost: '0.0.0.0', apiPort: 8000 } }
        ]
      }
    }
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8')
  }
}

const readDb = () => {
  ensureDbFile()
  try {
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading Firebase database:', error)
    return {}
  }
}

const writeDb = (data) => {
  ensureDbFile()
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing Firebase database:', error)
    return false
  }
}

export async function getFirebaseConfig() {
  const db = readDb()
  return db.config || { projectId: '', apiKey: '', connected: false }
}

export async function saveFirebaseConfig(projectId, apiKey, connected = true) {
  const db = readDb()
  db.config = { projectId, apiKey, connected }
  writeDb(db)
  return db.config
}

export async function disconnectFirebase() {
  const db = readDb()
  if (db.config) {
    db.config.connected = false
  }
  writeDb(db)
  return db.config
}

export async function getFirebaseUsers() {
  const db = readDb()
  return db.users || []
}

export async function addFirebaseUser(email, password) {
  const db = readDb()
  const newUser = {
    uid: 'usr_' + Math.floor(1000 + Math.random() * 9000),
    email: email,
    created: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString().split('T')[0]
  }
  db.users.push(newUser)
  writeDb(db)
  return newUser
}

export async function deleteFirebaseUser(uid) {
  const db = readDb()
  db.users = db.users.filter((u) => u.uid !== uid)
  writeDb(db)
  return true
}

export async function getFirestoreCollections() {
  const db = readDb()
  return db.collections || {}
}

export async function addFirestoreDocument(collectionName, docId, data) {
  const db = readDb()
  if (!db.collections) db.collections = {}
  if (!db.collections[collectionName]) db.collections[collectionName] = []

  // Update or insert
  const idx = db.collections[collectionName].findIndex((d) => d.id === docId)
  if (idx !== -1) {
    db.collections[collectionName][idx].data = {
      ...db.collections[collectionName][idx].data,
      ...data
    }
  } else {
    db.collections[collectionName].push({ id: docId, data })
  }
  writeDb(db)
  return db.collections[collectionName]
}

export async function deleteFirestoreDocument(collectionName, docId) {
  const db = readDb()
  if (db.collections && db.collections[collectionName]) {
    db.collections[collectionName] = db.collections[collectionName].filter((d) => d.id !== docId)
    writeDb(db)
  }
  return true
}
