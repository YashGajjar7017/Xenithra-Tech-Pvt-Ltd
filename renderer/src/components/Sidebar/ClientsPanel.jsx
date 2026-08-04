import React, { useState, useEffect } from 'react'

const ClientsPanel = () => {
  const [clients, setClients] = useState([])
  const [simulatedClient, setSimulatedClient] = useState(null) // { name, paired, tokenInput, status }
  const [selectedClient, setSelectedClient] = useState(null) // for showing token popup
  const [pairedCode, setPairedCode] = useState('')

  // Fetch client list initially and listen for updates
  useEffect(() => {
    if (window.api && typeof window.api.getTcpClients === 'function') {
      window.api.getTcpClients().then((clientsList) => {
        setClients(clientsList || [])
      })
    }

    if (window.api && typeof window.api.onTcpClientsUpdate === 'function') {
      window.api.onTcpClientsUpdate((updatedClients) => {
        setClients(updatedClients || [])
      })
    }

    // Listen to simulated client code-sync events from the server
    if (window.api && typeof window.api.onSimulatedClientCode === 'function') {
      window.api.onSimulatedClientCode((code) => {
        setPairedCode(code)
      })
    }

    // Listen to simulated client auth events
    if (window.api && typeof window.api.onSimulatedClientAuth === 'function') {
      window.api.onSimulatedClientAuth((success) => {
        if (success) {
          setSimulatedClient((prev) => prev ? { ...prev, paired: true, status: 'Authenticated' } : null)
        } else {
          setSimulatedClient((prev) => prev ? { ...prev, status: 'Failed Auth' } : null)
          alert('Incorrect Pairing Token entered on simulated client.')
        }
      })
    }
  }, [])

  const handleSimulateClient = async () => {
    const name = 'Developer iPad'
    setSimulatedClient({
      name,
      paired: false,
      tokenInput: '',
      status: 'Connected - Unpaired'
    })
    if (window.api && typeof window.api.simulateTcpClient === 'function') {
      await window.api.simulateTcpClient(name)
    }
  }

  const handleAuthSimulated = async () => {
    if (!simulatedClient || !simulatedClient.tokenInput) return
    if (window.api && typeof window.api.authSimulatedClient === 'function') {
      await window.api.authSimulatedClient(simulatedClient.tokenInput)
    }
  }

  const handleSimulatedCodeChange = async (e) => {
    const newCode = e.target.value
    setPairedCode(newCode)
    if (window.api && typeof window.api.sendSimulatedCode === 'function') {
      await window.api.sendSimulatedCode(newCode)
    }
  }

  const handleDisconnectSimulated = async () => {
    setSimulatedClient(null)
    setPairedCode('')
    if (window.api && typeof window.api.disconnectSimulated === 'function') {
      await window.api.disconnectSimulated()
    }
  }

  const handleClientClick = (client) => {
    setSelectedClient(client)
  }

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.header}>
        <span style={styles.title}>TCP/IP PAIR PROGRAMMING</span>
        <span style={styles.listeningBadge}>🔴 LISTENING</span>
      </div>

      <div style={styles.statusBox}>
        <div style={styles.statusText}>
          <strong>Local Network IP:</strong> Port 27789
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Pair code editor real-time with other devices on your local network.
        </div>
      </div>

      {/* Detected Clients */}
      <div style={styles.sectionHeader}>DETECTED DEVICES</div>

      <div style={styles.clientList}>
        {clients.length === 0 ? (
          <div style={styles.emptyText}>
            No client devices detected. Connect another client to port 27789 or start the simulator below.
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              onClick={() => handleClientClick(client)}
              style={{
                ...styles.clientItem,
                borderColor: client.authenticated ? '#00ffaa' : 'rgba(255,255,255,0.08)'
              }}
            >
              <div style={styles.clientInfo}>
                <div style={styles.clientName}>
                  <i className="bx bx-mobile-alt" style={{ marginRight: '6px' }}></i>
                  {client.name}
                </div>
                <div style={styles.clientIp}>{client.ip}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {client.authenticated ? (
                  <span style={styles.pairedLabel}>PAIRED</span>
                ) : (
                  <span style={styles.unpairedLabel}>UNPAIRED</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Simulator Actions */}
      <div style={styles.sectionHeader}>CLIENT SIMULATOR</div>
      
      {!simulatedClient ? (
        <button onClick={handleSimulateClient} style={styles.simulateBtn}>
          <i className="bx bx-devices" style={{ marginRight: '6px' }}></i>
          Simulate Remote TCP Client
        </button>
      ) : (
        <div style={styles.simContainer}>
          <div style={styles.simHeader}>
            <span>📱 simulated-client: <strong>{simulatedClient.name}</strong></span>
            <button onClick={handleDisconnectSimulated} style={styles.disconnectBtn}>Disconnect</button>
          </div>
          
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Status: <span style={{ color: simulatedClient.paired ? '#00ffaa' : '#ffb86c' }}>{simulatedClient.status}</span>
          </div>

          {!simulatedClient.paired ? (
            <div style={styles.authBox}>
              <input
                type="text"
                placeholder="Enter Pairing Token..."
                value={simulatedClient.tokenInput}
                onChange={(e) => setSimulatedClient({ ...simulatedClient, tokenInput: e.target.value })}
                style={styles.tokenInput}
              />
              <button onClick={handleAuthSimulated} style={styles.authBtn}>
                Pair Device
              </button>
            </div>
          ) : (
            <div style={styles.codeSyncBox}>
              <div style={{ fontSize: '11px', color: '#00ffaa', marginBottom: '4px' }}>
                ● Realtime pair programming active
              </div>
              <textarea
                value={pairedCode}
                onChange={handleSimulatedCodeChange}
                placeholder="Type code here to sync live with main IDE..."
                style={styles.simTextArea}
              />
            </div>
          )}
        </div>
      )}

      {/* Token Popup Modal */}
      {selectedClient && (
        <div style={styles.modalOverlay} onClick={() => setSelectedClient(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>DEVICE PAIRING</h5>
              <button onClick={() => setSelectedClient(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Enter this authentication token on your client device (<strong>{selectedClient.name}</strong>) to authorize:
              </p>
              <div style={styles.tokenCode}>{selectedClient.token}</div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setSelectedClient(null)} style={styles.okBtn}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '12px',
    color: 'var(--text-main)',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  title: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    color: 'var(--text-main)'
  },
  listeningBadge: {
    fontSize: '9px',
    background: 'rgba(255, 107, 107, 0.15)',
    color: '#ff6b6b',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: 'bold',
    border: '1px solid rgba(255,107,107,0.25)'
  },
  statusBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px'
  },
  statusText: {
    fontSize: '11px',
    color: '#00ffaa'
  },
  sectionHeader: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    marginBottom: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '4px'
  },
  clientList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  emptyText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '12px 0'
  },
  clientItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  clientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  clientName: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center'
  },
  clientIp: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  pairedLabel: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#00ffaa',
    background: 'rgba(0, 255, 170, 0.12)',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  unpairedLabel: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#ffb86c',
    background: 'rgba(255, 184, 108, 0.12)',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  simulateBtn: {
    background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.15) 0%, rgba(88, 166, 255, 0.05) 100%)',
    border: '1px solid rgba(88, 166, 255, 0.25)',
    color: '#58a6ff',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.25s ease',
    width: '100%'
  },
  simContainer: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '10px'
  },
  simHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  disconnectBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '11px'
  },
  authBox: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px'
  },
  tokenInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: '4px',
    padding: '6px',
    fontSize: '11px',
    outline: 'none'
  },
  authBtn: {
    background: '#58a6ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  codeSyncBox: {
    marginTop: '6px'
  },
  simTextArea: {
    width: '100%',
    height: '110px',
    background: '#0d1117',
    color: '#e6edf3',
    fontFamily: 'monospace',
    fontSize: '11px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.1)',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    width: '320px',
    background: '#161b22',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '16px',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8b949e',
    cursor: 'pointer',
    fontSize: '14px'
  },
  modalBody: {
    textAlign: 'center'
  },
  tokenCode: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00ffaa',
    letterSpacing: '4px',
    background: 'rgba(0,255,170,0.06)',
    border: '1px dashed rgba(0,255,170,0.3)',
    borderRadius: '6px',
    padding: '12px 0',
    margin: '10px 0'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px'
  },
  okBtn: {
    background: '#58a6ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  }
}

export default ClientsPanel
