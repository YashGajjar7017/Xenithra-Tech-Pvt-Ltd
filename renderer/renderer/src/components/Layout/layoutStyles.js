export const layoutStyles = {
  globalCSS: `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
      min-height: 100vh;
      background: radial-gradient(circle at top left, #ff00c8 0, transparent 55%),
                  radial-gradient(circle at bottom right, #00e5ff 0, #02030a 60%);
      color: #e5f2ff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    @keyframes borderFlow {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes gradientSweep {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    @keyframes spinBorder {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes runGlow {
      0% {
        background-position: 0% 50%;
        box-shadow: 0 0 16px rgba(0, 230, 118, 0.7);
      }
      100% {
        background-position: 100% 50%;
        box-shadow: 0 0 30px rgba(0, 230, 118, 1);
      }
    }
  `,

  container: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    background: 'radial-gradient(circle at top left, #ff00c8 0, transparent 55%), radial-gradient(circle at bottom right, #00e5ff 0, #02030a 60%)',
    color: '#e5f2ff'
  },

  app: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    position: 'relative',
    background: 'radial-gradient(circle at top, rgba(14, 23, 48, 0.92), rgba(4, 7, 18, 0.98))',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.7), 0 0 80px rgba(255, 0, 200, 0.45), 0 0 120px rgba(0, 229, 255, 0.45)',
    backdropFilter: 'blur(26px) saturate(180%)',
    overflow: 'hidden'
  },

  borderNeon: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '2px',
    background: 'conic-gradient(from 180deg, rgba(255, 0, 200, 0.9), rgba(0, 229, 255, 0.9), rgba(255, 234, 0, 0.8), rgba(255, 0, 200, 0.9))',
    WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
    WebkitMaskComposite: 'xor',
    mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
    maskComposite: 'exclude',
    opacity: 0.8,
    animation: 'borderFlow 16s linear infinite',
    pointerEvents: 'none',
    zIndex: 0
  },

  shell: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    borderRadius: 'inherit',
    overflow: 'hidden',
    zIndex: 1
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'radial-gradient(circle at top left, rgba(255, 0, 200, 0.16), transparent 60%), radial-gradient(circle at bottom right, rgba(0, 229, 255, 0.18), rgba(1, 2, 8, 0.98))'
  },

  content: {
    flex: 1,
    overflow: 'auto',
    padding: '20px'
  }
}
