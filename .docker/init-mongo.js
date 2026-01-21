// MongoDB initialization script
// This will run when the MongoDB container starts for the first time

db = db.getSiblingDB('human-error')

// Create collections if they don't exist
db.createCollection('usersignups')
db.createCollection('userlogins')
db.createCollection('sessions')

// Create indexes for better performance
db.usersignups.createIndex({ username: 1 }, { unique: true })
db.usersignups.createIndex({ email: 1 }, { unique: true })
db.userlogins.createIndex({ username: 1 }, { unique: true })
db.userlogins.createIndex({ email: 1 }, { unique: true })
db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // 24 hours

print('Database initialized successfully')
