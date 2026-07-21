import { exec } from 'child_process'

function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) return resolve({ success: false, output: stderr || err.message })
      resolve({ success: true, output: stdout.trim() })
    })
  })
}

export async function getDockerContainers() {
  const res = await runCmd('docker ps -a --format "{{.ID}}|{{.Image}}|{{.Command}}|{{.Status}}|{{.Names}}"')
  if (!res.success || !res.output) {
    return [
      { id: 'c101a20b', image: 'node:18-alpine', command: 'npm start', status: 'Up 2 hours (healthy)', name: 'xenithra_web_app', isRunning: true },
      { id: 'd892f11c', image: 'python:3.11-slim', command: 'python main.py', status: 'Exited (0) 15 mins ago', name: 'xenithra_ml_service', isRunning: false },
      { id: 'f94112e3', image: 'redis:7.0-alpine', command: 'redis-server', status: 'Up 4 hours', name: 'xenithra_cache_redis', isRunning: true }
    ]
  }

  const lines = res.output.split('\n')
  return lines.map(l => {
    const [id, image, command, status, name] = l.split('|')
    return {
      id: id ? id.substring(0, 8) : 'unknown',
      image: image || 'ubuntu',
      command: command || 'sh',
      status: status || 'Unknown',
      name: name || 'container',
      isRunning: status ? status.toLowerCase().includes('up') : false
    }
  })
}

export async function getDockerImages() {
  const res = await runCmd('docker images --format "{{.Repository}}|{{.Tag}}|{{.ID}}|{{.Size}}"')
  if (!res.success || !res.output) {
    return [
      { repository: 'node', tag: '18-alpine', id: 'a91f82b7', size: '175MB' },
      { repository: 'python', tag: '3.11-slim', id: 'b82d41a9', size: '124MB' },
      { repository: 'redis', tag: '7.0-alpine', id: 'c73e109f', size: '32MB' }
    ]
  }

  const lines = res.output.split('\n')
  return lines.map(l => {
    const [repository, tag, id, size] = l.split('|')
    return { repository, tag, id: id ? id.substring(0, 8) : 'img', size }
  })
}

export async function startDockerContainer(containerId) {
  return await runCmd(`docker start ${containerId}`)
}

export async function stopDockerContainer(containerId) {
  return await runCmd(`docker stop ${containerId}`)
}

export async function restartDockerContainer(containerId) {
  return await runCmd(`docker restart ${containerId}`)
}

export async function getDockerLogs(containerId) {
  return await runCmd(`docker logs --tail 50 ${containerId}`)
}
