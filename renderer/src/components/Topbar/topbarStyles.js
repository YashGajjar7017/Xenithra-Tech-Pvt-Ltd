export const topbarStyles = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'linear-gradient(90deg, rgba(4, 9, 24, 0.96), rgba(10, 2, 26, 0.96))',
    backdropFilter: 'blur(24px)',
    gap: '20px'
  },

  title: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: '#e8f5ff',
    margin: 0
  },

  controls: {
    display: 'flex',
    gap: '10px'
  },

  button: {
    marginLeft: '10px',
    padding: '5px 15px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.24)',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(20px)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
    fontFamily: 'inherit',

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 0 18px rgba(255, 0, 200, 0.9), 0 0 26px rgba(0, 229, 255, 0.9)'
    }
  },

  btnRun: {
    background: 'linear-gradient(120deg, #00e676, #00b0ff, #00e676)',
    backgroundSize: '220% 220%',
    boxShadow: '0 0 22px rgba(0, 230, 118, 0.9)',
    animation: 'runGlow 2.3s ease-in-out infinite alternate'
  },

  langSelect: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#e0f7fa',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  dropdown: {
    position: 'relative'
  },

  dropdownToggle: {
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    background: 'rgba(5, 9, 26, 0.96)',
    color: '#e0f7fa',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background 0.2s ease, transform 0.15s ease',
    fontFamily: 'inherit'
  },

  arrow: {
    display: 'inline-block',
    transition: 'transform 0.2s ease'
  },

  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: '140%',
    minWidth: '140px',
    borderRadius: '14px',
    background: 'rgba(4, 7, 22, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 18px 30px rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(18px)',
    overflow: 'hidden',
    transformOrigin: 'top right',
    transform: 'scaleY(1) translateY(0)',
    opacity: 1,
    pointerEvents: 'auto',
    zIndex: 10
  },

  dropdownItem: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: '#e8f5ff',
    textAlign: 'left',
    fontSize: '12px',
    padding: '7px 12px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    fontFamily: 'inherit',

    '&:hover': {
      background: 'rgba(0, 229, 255, 0.28)'
    }
  }
}
