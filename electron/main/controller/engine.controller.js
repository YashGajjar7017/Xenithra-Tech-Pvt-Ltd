const path = require('path')
const fs = require('fs')
const formidable = require('formidable')
const rootDir = require('../util/path')

// Add required imports for reusable functions
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const session = require('express-session')

// Utility functions - optimized and cleaned up
const generateToken = (length = 20) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Reusable FileReader utility
const fileReader = {
  readFile: (filePath, encoding = 'utf8') => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, encoding, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  },

  readFileSync: (filePath, encoding = 'utf8') => {
    try {
      return fs.readFileSync(filePath, encoding)
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`)
    }
  },

  readJSON: async (filePath) => {
    try {
      const data = await fileReader.readFile(filePath)
      return JSON.parse(data)
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`)
    }
  }
}

// Reusable bcrypt utility
const cryptoUtils = {
  hashPassword: async (password, saltRounds = 10) => {
    try {
      return await bcrypt.hash(password, saltRounds)
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`)
    }
  },

  comparePassword: async (plainPassword, hashedPassword) => {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      throw new Error(`Failed to compare passwords: ${error.message}`)
    }
  }
}

// Reusable JWT utility
const jwtUtils = {
  generateToken: (payload, secret, expiresIn = '1h') => {
    try {
      return jwt.sign(payload, secret, { expiresIn })
    } catch (error) {
      throw new Error(`Failed to generate JWT: ${error.message}`)
    }
  },

  verifyToken: (token, secret) => {
    try {
      return jwt.verify(token, secret)
    } catch (error) {
      throw new Error(`Invalid or expired token: ${error.message}`)
    }
  },

  decodeToken: (token) => {
    try {
      return jwt.decode(token)
    } catch (error) {
      throw new Error(`Failed to decode token: ${error.message}`)
    }
  }
}

// Reusable session utility
const sessionUtils = {
  createSession: (req, userData) => {
    if (!req.session) {
      throw new Error('Session middleware not initialized')
    }
    req.session.user = userData
    req.session.isAuthenticated = true
    return req.session
  },

  destroySession: (req) => {
    return new Promise((resolve, reject) => {
      if (!req.session) {
        reject(new Error('Session middleware not initialized'))
        return
      }
      req.session.destroy((err) => {
        if (err) reject(err)
        else resolve(true)
      })
    })
  },

  getSessionData: (req) => {
    if (!req.session) {
      throw new Error('Session middleware not initialized')
    }
    return {
      user: req.session.user || null,
      isAuthenticated: req.session.isAuthenticated || false
    }
  },

  updateSession: (req, newData) => {
    if (!req.session) {
      throw new Error('Session middleware not initialized')
    }
    Object.assign(req.session.user || {}, newData)
    return req.session
  }
}

// Route handlers - cleaned and optimized
const ComplierPage = (req, res) => {
  res.sendFile(path.join(rootDir, 'views', 'index.html'))
}

const startPage = (req, res) => {
  res.sendFile(path.join(rootDir, 'other', 'start', 'index.html'))
}

const features = (req, res) => {
  res.send(
    "<html><body><center><h2>Features are loading! but you can't wait for that</h2></center></body></html>"
  )
}

// Safe session handler
const sessionHandler = (req, res) => {
  // If session middleware is not initialized or user is not authenticated, redirect to login
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/Account/login')
    }
    // If authenticated, redirect to start page
    return res.redirect('/start')
  } catch (err) {
    console.error('Session handler error:', err)
    return res.redirect('/Account/login')
  }
}

const sessionToken = (req, res) => {
  res.sendFile(path.join(rootDir, 'views', 'Servcies', 'session.ejs'))
}

const sessionShare = (req, res) => {
  res.sendFile(path.join(rootDir, 'other', 'forgotPassword.html'))
}

const fileupload = (req, res) => {
  res.send(`
        <body style="background:black;">
            <center>
                <h2 style="color:red;">
                    <p style="color:yellow;">Warning!</p> 
                    If you manually update complier then it would be crash.. so be aware from this
                    <br>Type :<br>/UpdateComplier --debug
                </h2>
            </center>
        </body>
    `)
}

const account = (req, res) => {
  res.redirect('/Account/login')
}

const accountNumber = (req, res) => {
  const { userState, NO } = req.params

  if (NO.length === 30 && userState === 'true') {
    res.cookie('navbar', true)
    return res.redirect(`/complier/account/user/${NO}`)
  } else if (NO.length === 30 && userState === 'false') {
    return res.redirect('/Dashboard')
  } else {
    return res.redirect('/404')
  }
}

const uploadFile = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write(`
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="filetoupload"><br>
            <input type="submit">
        </form>
    `)

  if (req.method === 'POST') {
    const form = new formidable.IncomingForm()

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Error processing file upload')
        return
      }

      if (!files.filetoupload) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('No file uploaded')
        return
      }

      const oldpath = files.filetoupload.filepath
      const newpath = path.join('A:', 'temp', files.filetoupload.originalFilename)

      fs.rename(oldpath, newpath, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' })
          res.end('Error moving file')
          return
        }
        res.write('File uploaded and moved!')
        res.end()
      })
    })
  } else {
    res.end()
  }
}

// Export reusable utilities and handlers
module.exports = {
  ComplierPage,
  startPage,
  features,
  session: sessionHandler,
  sessionToken,
  sessionShare,
  fileupload,
  account,
  accountNumber,
  uploadFile,
  cryptoUtils,
  jwtUtils,
  sessionUtils
}
