import express from 'express'
import http from 'http'
import path from 'path'
import fs from 'fs'

let serverInstance = null
let activePort = 5500
let activeRootPath = ''
let sseClients = []
let fileWatcher = null

/**
 * Starts a live server serving the specified directory (or current working directory)
 * @param {string} rootPath 
 * @param {number} preferredPort 
 * @returns {Promise<{success: boolean, port: number, url: string, message?: string}>}
 */
export function startLiveServer(rootPath, preferredPort = 5500) {
  return new Promise((resolve) => {
    if (serverInstance) {
      stopLiveServer()
    }

    const targetDir = rootPath && fs.existsSync(rootPath) ? rootPath : process.cwd()
    activeRootPath = targetDir

    const app = express()

    // Live reload SSE endpoint
    app.get('/__live_reload_sse', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
      res.write('data: connected\n\n')
      sseClients.push(res)
      req.on('close', () => {
        sseClients = sseClients.filter(client => client !== res)
      })
    })

    // Custom middleware to inject live reload script into index.html / html requests
    app.use((req, res, next) => {
      const reqPath = req.path === '/' ? '/index.html' : req.path
      const filePath = path.join(targetDir, reqPath)

      if (filePath.endsWith('.html') && fs.existsSync(filePath)) {
        try {
          let htmlContent = fs.readFileSync(filePath, 'utf-8')
          const sseScript = `
            <script>
              (function() {
                const es = new EventSource('/__live_reload_sse');
                es.onmessage = function(e) {
                  if (e.data === 'reload') {
                    console.log('[LiveServer] File change detected, reloading page...');
                    window.location.reload();
                  }
                };
                es.onerror = function() {
                  setTimeout(() => window.location.reload(), 2000);
                };
              })();
            </script>
          `
          if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `${sseScript}\n</body>`)
          } else {
            htmlContent += sseScript
          }
          res.setHeader('Content-Type', 'text/html')
          return res.send(htmlContent)
        } catch (err) {
          console.error('[liveServer] HTML injection error:', err)
        }
      }
      next()
    })

    // Static file serving fallback
    app.use(express.static(targetDir))

    // Fallback to index.html for SPA routes
    app.get('*', (req, res) => {
      const indexPath = path.join(targetDir, 'index.html')
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath)
      } else {
        res.status(404).send(`<h3>Live Server Operational</h3><p>Directory: ${targetDir}</p><p>No <code>index.html</code> found in root.</p>`)
      }
    })

    const tryListen = (portToTry) => {
      const server = http.createServer(app)

      server.listen(portToTry, '0.0.0.0', () => {
        activePort = portToTry
        serverInstance = server
        setupFileWatcher(targetDir)

        console.log(`[liveServer] Started on http://localhost:${activePort} serving ${targetDir}`)
        resolve({
          success: true,
          port: activePort,
          url: `http://localhost:${activePort}`,
          rootPath: targetDir
        })
      })

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && portToTry < 5520) {
          console.warn(`[liveServer] Port ${portToTry} in use, trying ${portToTry + 1}...`)
          tryListen(portToTry + 1)
        } else {
          console.error('[liveServer] Start error:', err)
          resolve({ success: false, message: err.message })
        }
      })
    }

    tryListen(preferredPort)
  })
}

/**
 * Stops running live server and closes watcher
 */
export function stopLiveServer() {
  if (fileWatcher) {
    try { fileWatcher.close() } catch (e) {}
    fileWatcher = null
  }

  sseClients.forEach(res => {
    try { res.write('data: close\n\n'); res.end() } catch (e) {}
  })
  sseClients = []

  if (serverInstance) {
    try { serverInstance.close() } catch (e) {}
    serverInstance = null
    console.log('[liveServer] Stopped live server')
  }

  return { success: true, port: activePort }
}

/**
 * Returns active live server status
 */
export function getLiveServerStatus() {
  return {
    running: !!serverInstance,
    port: activePort,
    url: serverInstance ? `http://localhost:${activePort}` : null,
    rootPath: activeRootPath
  }
}

function setupFileWatcher(targetDir) {
  if (fileWatcher) {
    try { fileWatcher.close() } catch (e) {}
  }
  let debounceTimeout = null
  try {
    fileWatcher = fs.watch(targetDir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.includes('node_modules') || filename.includes('.git') || filename.includes('dist'))) return
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        console.log(`[liveServer] File change detected (${filename}), notifying clients...`)
        sseClients.forEach(client => {
          try { client.write('data: reload\n\n') } catch (e) {}
        })
      }, 300)
    })
  } catch (err) {
    console.warn('[liveServer] Watcher setup warning:', err.message)
  }
}
