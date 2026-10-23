import React, { useEffect, useState } from 'react'
import splashImage from '../../assets/splash_bg.jpg'

/**
 * SplashScreen — Compact 10%-of-screen startup badge for Xenithra IDE.
 * No full-screen overlay, no blur on the background, no background dimming.
 * Just a small floating card in the bottom-center with the IDE artwork + progress bar.
 */
const SplashScreen = ({ onDone }) => {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Start fade after 2.4 seconds
    const fadeTimer = setTimeout(() => setFading(true), 2400)
    // Completely unmount after fade transition (2.85s total)
    const doneTimer = setTimeout(() => {
      setVisible(false)
      if (onDone) onDone()
    }, 2850)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  if (!visible) return null

  return (
    <>
      {/* Compact 10%-of-screen splash card — no overlay, no blur, no background */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: fading ? 'none' : 'all',
          userSelect: 'none',
          // 10% of the smaller screen dimension
          width: '10vmin',
          height: '10vmin',
          minWidth: '72px',
          minHeight: '72px',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          background: '#0a151d',
          animation: 'splashPop 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Splash artwork image */}
        <img
          src={splashImage}
          alt="Xenithra IDE"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block'
          }}
          onError={(e) => {
            e.currentTarget.src = '/Images/splash_bg.jpg'
          }}
        />

        {/* Animated Loading Bar along bottom edge */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00c8ff, #7c3aed, #ff007f)',
              borderRadius: '2px',
              animation: 'splashProgress 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.9)'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashPop {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.85);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
        @keyframes splashProgress {
          0%   { width: 0%; }
          30%  { width: 45%; }
          70%  { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  )
}

export default SplashScreen
