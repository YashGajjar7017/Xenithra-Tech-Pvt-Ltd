import { exec, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import http from 'http'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// State for active service processes
const servicesState = {
  php: { status: 'stopped', port: 8081, process: null },
  mysql: { status: 'stopped', port: 3306, process: null },
  phpmyadmin: { status: 'stopped', port: 8085, process: null }
}

// Check if commands exist on system
export const checkSystemInstalled = () => {
  return new Promise((resolve) => {
    exec('where php', (phpErr) => {
      exec('where mysql', (mysqlErr) => {
        resolve({
          php: !phpErr,
          mysql: !mysqlErr,
          phpmyadmin: false // phpmyadmin is normally not in PATH
        })
      })
    })
  })
}

// Get current state of XAMPP services
export const getXamppStatus = () => {
  return {
    php: servicesState.php.status,
    mysql: servicesState.mysql.status,
    phpmyadmin: servicesState.phpmyadmin.status,
    ports: {
      php: servicesState.php.port,
      mysql: servicesState.mysql.port,
      phpmyadmin: servicesState.phpmyadmin.port
    }
  }
}

// Start PHP server
export const startPhpService = (docRoot = '') => {
  return new Promise((resolve) => {
    if (servicesState.php.status === 'running') {
      return resolve({ success: true, message: 'PHP service already running' })
    }

    // Try finding php executable
    exec('where php', (err, stdout) => {
      let phpPath = 'php'
      if (err) {
        // Look in default XAMPP folder as fallback
        const xamppPhp = 'C:\\xampp\\php\\php.exe'
        if (fs.existsSync(xamppPhp)) {
          phpPath = xamppPhp
        } else {
          // Fallback to simulated PHP service
          servicesState.php.status = 'running'
          startSimulatedPhpServer(servicesState.php.port)
          return resolve({ success: true, message: 'Simulated PHP web server started (PHP not found in PATH)' })
        }
      } else {
        phpPath = stdout.split('\r\n')[0].trim()
      }

      const root = docRoot || path.join(__dirname, '../temp')
      if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true })
      }

      try {
        const phpProc = spawn(phpPath, ['-S', `localhost:${servicesState.php.port}`, '-t', root])
        servicesState.php.process = phpProc
        servicesState.php.status = 'running'

        phpProc.on('error', () => {
          servicesState.php.status = 'stopped'
        })

        phpProc.on('exit', () => {
          servicesState.php.status = 'stopped'
          servicesState.php.process = null
        })

        resolve({ success: true, message: 'PHP web server started successfully' })
      } catch (ex) {
        resolve({ success: false, message: `Failed to spawn PHP: ${ex.message}` })
      }
    })
  })
}

// Start MySQL Database Service
export const startMysqlService = () => {
  return new Promise((resolve) => {
    if (servicesState.mysql.status === 'running') {
      return resolve({ success: true, message: 'MySQL service already running' })
    }

    exec('where mysqld', (err, stdout) => {
      let mysqldPath = 'mysqld'
      if (err) {
        const xamppMysql = 'C:\\xampp\\mysql\\bin\\mysqld.exe'
        if (fs.existsSync(xamppMysql)) {
          mysqldPath = xamppMysql
        } else {
          // Fallback to simulated MySQL service
          servicesState.mysql.status = 'running'
          startSimulatedMysqlPortal(servicesState.phpmyadmin.port)
          servicesState.phpmyadmin.status = 'running'
          return resolve({ success: true, message: 'Simulated MySQL portal & engine activated' })
        }
      } else {
        mysqldPath = stdout.split('\r\n')[0].trim()
      }

      try {
        const mysqlProc = spawn(mysqldPath, [`--port=${servicesState.mysql.port}`])
        servicesState.mysql.process = mysqlProc
        servicesState.mysql.status = 'running'

        mysqlProc.on('exit', () => {
          servicesState.mysql.status = 'stopped'
          servicesState.mysql.process = null
        })

        // Also start phpMyAdmin redirect server if phpMyAdmin is installed
        startPhpmyadminService()

        resolve({ success: true, message: 'MySQL service started successfully' })
      } catch (ex) {
        resolve({ success: false, message: `Failed to spawn MySQL: ${ex.message}` })
      }
    })
  })
}

// Stop a service
export const stopXamppService = (name) => {
  if (servicesState[name] && servicesState[name].process) {
    try {
      servicesState[name].process.kill()
    } catch (e) {}
    servicesState[name].process = null
  }
  servicesState[name].status = 'stopped'
  
  if (name === 'mysql') {
    stopXamppService('phpmyadmin')
  }

  return { success: true, status: getXamppStatus() }
}

// Start phpMyAdmin Service (Web interface)
const startPhpmyadminService = () => {
  // phpMyAdmin requires PHP server pointing to phpMyAdmin folder.
  const pmaPath = 'C:\\xampp\\phpMyAdmin'
  if (fs.existsSync(pmaPath)) {
    exec('where php', (err, stdout) => {
      let phpPath = err ? 'C:\\xampp\\php\\php.exe' : stdout.split('\r\n')[0].trim()
      if (fs.existsSync(phpPath)) {
        try {
          const pmaProc = spawn(phpPath, ['-S', `localhost:${servicesState.phpmyadmin.port}`, '-t', pmaPath])
          servicesState.phpmyadmin.process = pmaProc
          servicesState.phpmyadmin.status = 'running'

          pmaProc.on('exit', () => {
            servicesState.phpmyadmin.status = 'stopped'
            servicesState.phpmyadmin.process = null
          })
        } catch (e) {
          startSimulatedMysqlPortal(servicesState.phpmyadmin.port)
        }
      } else {
        startSimulatedMysqlPortal(servicesState.phpmyadmin.port)
      }
    })
  } else {
    // Start simulation server
    startSimulatedMysqlPortal(servicesState.phpmyadmin.port)
  }
}

// Simulators for Offline/Mock mode
let simMysqlServer = null
let simPhpServer = null

function startSimulatedPhpServer(port) {
  if (simPhpServer) return
  simPhpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <html>
        <head>
          <title>Xenithra PHP Development Server</title>
          <style>
            body { background: #0f141c; color: #abb2bf; font-family: sans-serif; padding: 40px; }
            h1 { color: #00ffaa; }
            pre { background: #1b212c; padding: 20px; border-radius: 8px; border: 1px solid #2d3139; }
          </style>
        </head>
        <body>
          <h1>Xenithra Simulated PHP Engine</h1>
          <p>This web server is running in simulated PHP mode because no system-wide PHP was found.</p>
          <p><b>Request Path:</b> \${req.url}</p>
          <p><b>Server status:</b> Active & Listening</p>
        </body>
      </html>
    `)
  })
  simPhpServer.listen(port)
}

function startSimulatedMysqlPortal(port) {
  if (simMysqlServer) return
  simMysqlServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <html>
        <head>
          <title>phpMyAdmin - Inbuilt SQL Client</title>
          <style>
            body { background: #0d1117; color: #c9d1d9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; }
            header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #30363d; padding-bottom: 15px; }
            h1 { color: #58a6ff; font-size: 20px; margin: 0; }
            .container { display: flex; gap: 20px; margin-top: 20px; }
            .sidebar { width: 200px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 15px; font-size: 13px; }
            .content { flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 20px; }
            .table-list { list-style: none; padding: 0; margin: 10px 0; }
            .table-list li { padding: 6px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
            .table-list li:hover { background: #21262d; color: #58a6ff; }
            textarea { width: 100%; height: 100px; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; color: #58a6ff; font-family: monospace; padding: 10px; box-sizing: border-box; resize: none; outline: none; margin-bottom: 10px; }
            button { background: #238636; border: 1px solid rgba(240,246,252,0.1); border-radius: 6px; color: #fff; cursor: pointer; font-weight: bold; padding: 8px 16px; font-size: 13px; }
            button:hover { background: #2ea043; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background: #21262d; padding: 8px; border: 1px solid #30363d; text-align: left; }
            td { padding: 8px; border: 1px solid #30363d; }
            tr:nth-child(even) { background: #0d1117; }
          </style>
        </head>
        <body>
          <header>
            <h1>🐬 Simulated phpMyAdmin / MySQL Portal</h1>
            <span style="color: #3fb950; font-size: 12px; background: rgba(56,139,253,0.15); padding: 4px 10px; border-radius: 10px;">MySQL Connected</span>
          </header>
          <div class="container">
            <div class="sidebar">
              <h3>Databases</h3>
              <ul class="table-list">
                <li onclick="alert('Loaded database: xenithra_db')">📁 xenithra_db</li>
                <li onclick="alert('Loaded database: information_schema')">📁 information_schema</li>
                <li onclick="alert('Loaded database: mysql')">📁 mysql</li>
              </ul>
              <h3>Tables in xenithra_db</h3>
              <ul class="table-list">
                <li>📋 users</li>
                <li>📋 projects</li>
                <li>📋 sessions</li>
              </ul>
            </div>
            <div class="content">
              <h3>SQL Query Executor</h3>
              <textarea placeholder="SELECT * FROM users;"></textarea>
              <button onclick="alert('Query executed successfully on mock database!')">Run Query</button>
              
              <h3 style="margin-top: 25px;">Table: users</h3>
              <table>
                <thead>
                  <tr>
                    <th>id</th>
                    <th>username</th>
                    <th>email</th>
                    <th>role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>admin</td>
                    <td>admin@xenithra.com</td>
                    <td>Administrator</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>yash_gajjar</td>
                    <td>yash@xenithra.com</td>
                    <td>Lead Developer</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>guest_dev</td>
                    <td>guest@xenithra.com</td>
                    <td>Collaborator</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `)
  })
  simMysqlServer.listen(port)
  servicesState.phpmyadmin.status = 'running'
}
