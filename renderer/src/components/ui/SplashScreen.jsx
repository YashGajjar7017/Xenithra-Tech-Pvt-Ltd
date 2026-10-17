import React, { useEffect, useState } from 'react'
import splashImage from '../../assets/splash_bg.jpg'

/**
 * SplashScreen — JetBrains-style compact startup splash screen for Xenithra IDE.
 * Centered floating card with the exact WebStorm-style artwork and progress indicator.
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'all',
        userSelect: 'none'
      }}
    >
      {/* Floating JetBrains-style Splash Dialog Card */}
      <div
        style={{
          position: 'relative',
          width: '640px',
          height: '380px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.14)',
          background: '#0a151d',
          animation: 'splashPop 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Splash artwork image */}
        <img
          src={splashImage}
          alt="Xenithra IDE Splash"
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
            // Fallback to public path if bundler URL fails
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
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 10
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00c8ff, #7c3aed, #ff007f)',
              borderRadius: '2px',
              animation: 'splashProgress 2.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              boxShadow: '0 0 10px rgba(0, 200, 255, 0.9)'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashPop {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashProgress {
          0%   { width: 0%; }
          30%  { width: 45%; }
          70%  { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
