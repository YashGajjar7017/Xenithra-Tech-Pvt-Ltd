import React, { useEffect, useState } from 'react'

/**
 * SplashScreen — JetBrains-style compact startup splash screen for Xenithra IDE.
 * Centered floating card with the exact WebStorm-style artwork and progress indicator.
 */
const SplashScreen = ({ onDone }) => {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Start fade after 2.2 seconds
    const fadeTimer = setTimeout(() => setFading(true), 2200)
    // Completely unmount after fade transition (2.7s total)
    const doneTimer = setTimeout(() => {
      setVisible(false)
      if (onDone) onDone()
    }, 2700)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 14, 20, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.45s ease',
        pointerEvents: fading ? 'none' : 'all',
        userSelect: 'none'
      }}
    >
      {/* Floating JetBrains-style Splash Dialog Card */}
      <div
        style={{
          position: 'relative',
          width: '630px',
          height: '385px',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          background: '#0d1e29',
          animation: 'splashPop 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Splash artwork image, clipped to exclude taskbar artifacts */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/Images/splash_bg.jpg)',
            backgroundSize: '100% 108%', // slightly zooms to crop bottom screenshot edge cleanly
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
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
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 10
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00c8ff, #7c3aed, #ff007f)',
              borderRadius: '2px',
              animation: 'splashProgress 2.2s ease-in-out forwards',
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.8)'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashPop {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashProgress {
          0%   { width: 0%; }
          35%  { width: 50%; }
          75%  { width: 82%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
