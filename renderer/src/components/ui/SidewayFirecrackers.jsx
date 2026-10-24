import React, { useEffect, useRef, useState } from 'react'

/**
 * SidewayFirecrackers — High-impact celebratory particle cannon.
 * Blasts firecracker sparklers, confetti streamers, and golden stars
 * sideways from both edges of the screen towards the center!
 */
export const triggerCelebration = () => {
  window.dispatchEvent(new CustomEvent('trigger-license-celebration'))
}

const SidewayFirecrackers = () => {
  const canvasRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let animId = null
    let particles = []

    const colors = [
      '#00f3ff', // Neon Cyan
      '#a855f7', // Electric Violet
      '#ec4899', // Hot Pink
      '#eab308', // Radiant Gold
      '#22c55e', // Emerald
      '#f97316', // Bright Orange
      '#38bdf8', // Sky Blue
      '#ffffff'  // Sparkling White
    ]

    const launchCannons = () => {
      setIsActive(true)
      const canvas = canvasRef.current
      if (!canvas) return
      const width = (canvas.width = window.innerWidth)
      const height = (canvas.height = window.innerHeight)
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      particles = []

      // Generate particles for both Left and Right side cannons
      const sides = [
        { x: 0, dir: 1, originY: height * 0.45 },
        { x: width, dir: -1, originY: height * 0.45 }
      ]

      sides.forEach((side) => {
        // Firecracker sparkles (bursts of fiery sparks)
        for (let i = 0; i < 90; i++) {
          const angle = (side.dir === 1 ? -0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.95
          const speed = Math.random() * 16 + 10
          particles.push({
            type: 'firecracker',
            x: side.x,
            y: side.originY + (Math.random() - 0.5) * 50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: 0.28,
            friction: 0.982,
            radius: Math.random() * 2.8 + 1.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: Math.random() * 0.012 + 0.007,
            sparkleTimer: Math.random() * 30 + 10,
            hasPopped: false
          })
        }

        // Confetti ribbons & fluttering rectangles
        for (let i = 0; i < 75; i++) {
          const angle = (side.dir === 1 ? -0.38 : Math.PI - 0.38) + (Math.random() - 0.5) * 1.1
          const speed = Math.random() * 14 + 8
          particles.push({
            type: 'confetti',
            x: side.x,
            y: side.originY + (Math.random() - 0.5) * 40,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: 0.18,
            friction: 0.985,
            width: Math.random() * 9 + 6,
            height: Math.random() * 5 + 3,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.22,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: Math.random() * 0.008 + 0.005
          })
        }

        // Golden Stars
        for (let i = 0; i < 35; i++) {
          const angle = (side.dir === 1 ? -0.4 : Math.PI - 0.4) + (Math.random() - 0.5) * 0.8
          const speed = Math.random() * 13 + 7
          particles.push({
            type: 'star',
            x: side.x,
            y: side.originY + (Math.random() - 0.5) * 30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: 0.15,
            friction: 0.98,
            size: Math.random() * 6 + 4,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.15,
            color: '#ffd700',
            alpha: 1,
            decay: Math.random() * 0.009 + 0.005
          })
        }
      })

      const render = () => {
        ctx.clearRect(0, 0, width, height)

        let aliveCount = 0

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          if (p.alpha <= 0) continue

          aliveCount++

          p.vx *= p.friction
          p.vy *= p.friction
          p.vy += p.gravity
          p.x += p.vx
          p.y += p.vy
          p.alpha -= p.decay

          ctx.save()
          ctx.globalAlpha = Math.max(0, p.alpha)

          if (p.type === 'confetti') {
            p.rotation += p.vRot
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rotation)
            ctx.fillStyle = p.color
            ctx.shadowColor = p.color
            ctx.shadowBlur = 6
            ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
          } else if (p.type === 'firecracker') {
            ctx.fillStyle = p.color
            ctx.shadowColor = p.color
            ctx.shadowBlur = 10
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fill()

            // Micro trail spark
            if (Math.random() > 0.5 && p.alpha > 0.3) {
              ctx.fillStyle = '#ffffff'
              ctx.shadowBlur = 4
              ctx.fillRect(p.x - p.vx * 0.5, p.y - p.vy * 0.5, 1.8, 1.8)
            }
          } else if (p.type === 'star') {
            p.rotation += p.vRot
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rotation)
            ctx.fillStyle = p.color
            ctx.shadowColor = '#ffd700'
            ctx.shadowBlur = 12

            // Draw 5-pointed star
            ctx.beginPath()
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(
                Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size,
                -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size
              )
              ctx.lineTo(
                Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size * 0.45),
                -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size * 0.45)
              )
            }
            ctx.closePath()
            ctx.fill()
          }

          ctx.restore()
        }

        if (aliveCount > 0) {
          animId = requestAnimationFrame(render)
        } else {
          ctx.clearRect(0, 0, width, height)
          setIsActive(false)
        }
      }

      cancelAnimationFrame(animId)
      animId = requestAnimationFrame(render)
    }

    const handleTrigger = () => {
      launchCannons()
    }

    window.addEventListener('trigger-license-celebration', handleTrigger)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('trigger-license-celebration', handleTrigger)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999,
        display: isActive ? 'block' : 'none'
      }}
    />
  )
}

export default SidewayFirecrackers
