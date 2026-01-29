export const sidebarStyles = {
  sidebar: {
    width: '230px',
    padding: '20px 16px',
    background: 'linear-gradient(165deg, rgba(11, 26, 56, 0.96), rgba(2, 6, 20, 0.96))',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(24px)',
    position: 'relative',
    transition: 'width 0.3s ease',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    fontWeight: '650',
    fontSize: '19px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#e5f2ff'
  },

  logoBox: {
    width: '32px',
    height: '32px',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    fontSize: '18px',
    background: 'radial-gradient(circle at 30% 0, #ffffff, #ffe6ff)',
    boxShadow: '0 0 18px rgba(255, 0, 200, 0.8), 0 0 10px rgba(255, 255, 255, 0.7)',
    color: '#2b0136'
  },

  subtitle: {
    fontSize: '11px',
    marginBottom: '16px',
    opacity: 0.85,
    color: '#e5f2ff'
  },

  pillLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: '10px',
    opacity: 0.6,
    color: '#e5f2ff'
  },

  buttonGroup: {
    marginBottom: '16px'
  },

  button: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    background: 'radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.15), rgba(6, 10, 30, 0.94))',
    color: '#fdfdfd',
    textAlign: 'left',
    padding: '7px 13px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '8px',
    backdropFilter: 'blur(20px)',
    transition: 'transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'inherit',
    border: 'none',

    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.55)',
      background: 'rgba(6, 10, 30, 0.96)'
    }
  },

  userSection: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },

  userLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.8), rgba(255, 0, 200, 0.8))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },

  userName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00e5ff'
  },

  collapsedIcons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '20px',
    alignItems: 'center'
  },

  collapsedIcon: {
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#e5f2ff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.2s ease',

    '&:hover': {
      background: 'rgba(0, 229, 255, 0.3)',
      borderColor: 'rgba(0, 229, 255, 0.6)',
      transform: 'scale(1.1)',
      boxShadow: '0 0 8px rgba(0, 229, 255, 0.4)'
    }
  }
}
