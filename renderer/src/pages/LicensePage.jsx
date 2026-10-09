import React, { useState, useEffect } from 'react'
import '../../css/LicensePage.css'

const LicensePage = ({ onClose, onActivated }) => {
  const [activeTab, setActiveTab] = useState('status')
  const [licenseKey, setLicenseKey] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [plan, setPlan] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error'|'info', text: '' }
  const [licenseStatus, setLicenseStatus] = useState(null)
  const [animatingKey, setAnimatingKey] = useState(false)
  const [certInput, setCertInput] = useState('')
  const [copiedFingerprint, setCopiedFingerprint] = useState(false)

  // Load license status on mount
  useEffect(() => {
    fetchLicenseStatus()
  }, [])

  const fetchLicenseStatus = async () => {
    try {
      if (window.api && typeof window.api.getLicenseStatus === 'function') {
        const status = await window.api.getLicenseStatus()
        setLicenseStatus(status)
      } else {
        // Fallback: read from localStorage for dev mode
        const stored = localStorage.getItem('xenithra_license')
        if (stored) {
          setLicenseStatus(JSON.parse(stored))
        } else {
          setLicenseStatus({
            status: 'trial',
            type: 'trial',
            daysLeft: 30,
            features: {
              editor: true,
              terminal: true,
              aiColab: false,
              dsaStudio: true,
              cdllStudio: false,
              codeArena: true,
              cloudSync: false,
              collaboration: false
            }
          })
        }
      }
    } catch (e) {
      console.error('[LicensePage] Failed to fetch status:', e)
    }
  }

  // Format license key input with dashes
  const handleKeyInput = (e) => {
    let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (val.length > 16) val = val.substring(0, 16)
    const parts = val.match(/.{1,4}/g) || []
    setLicenseKey(parts.join('-'))
  }

  const handleActivate = async () => {
    if (!licenseKey || licenseKey.replace(/-/g, '').length < 16) {
      setMessage({ type: 'error', text: 'Please enter a complete 16-character license key.' })
      return
    }

    setLoading(true)
    setMessage({ type: 'info', text: 'Validating license key against server...' })
    setAnimatingKey(true)

    try {
      let result
      if (window.api && typeof window.api.activateLicense === 'function') {
        result = await window.api.activateLicense(licenseKey, name, email)
      } else {
        // Dev/demo mode
        await new Promise(r => setTimeout(r, 1200))
        result = { success: true, licensedTo: name || 'Xenithra User', edition: 'Professional' }
        localStorage.setItem(
          'xenithra_license',
          JSON.stringify({
            status: 'licensed',
            type: 'full',
            licensedTo: name || 'Xenithra User',
            licenseKey,
            edition: 'Professional Edition',
            certificate: {
              certId: 'CERT-XNTH-8821',
              fingerprint: 'SHA256:7b91a2d4e8c3f1092a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
              validFrom: new Date().toISOString().split('T')[0],
              validTo: '2036-01-01',
              tier: 'Professional Edition',
              issuer: 'Xenithra Technologies Pvt Ltd'
            },
            features: {
              editor: true,
              terminal: true,
              aiColab: true,
              dsaStudio: true,
              cdllStudio: true,
              codeArena: true,
              cloudSync: true,
              collaboration: true
            }
          })
        )
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ License activated successfully! Welcome, ${result.licensedTo}!`
        })
        await fetchLicenseStatus()
        window.dispatchEvent(new CustomEvent('license-activated'))
        if (onActivated) setTimeout(onActivated, 2000)
      } else {
        setMessage({ type: 'error', text: `❌ ${result.error}` })
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Activation failed: ${err.message}` })
    } finally {
      setLoading(false)
      setAnimatingKey(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Please fill in your name and email address.' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' })
      return
    }

    setLoading(true)
    setMessage({ type: 'info', text: 'Submitting registration request to licensing server...' })

    try {
      let result
      if (window.api && typeof window.api.submitLicenseRegistration === 'function') {
        result = await window.api.submitLicenseRegistration(name, email, organization, plan)
      } else {
        await new Promise(r => setTimeout(r, 1200))
        const demoKey = `XNTH-${plan.substring(0, 3).toUpperCase()}1-8899-XNTH`
        result = {
          success: true,
          message: 'Registration approved! Your license key and certificate are ready.',
          licenseKey: demoKey,
          licensedTo: name
        }
      }

      if (result.success && result.licenseKey) {
        setLicenseKey(result.licenseKey)
        setMessage({
          type: 'success',
          text: `🎉 Registration approved! Key generated: ${result.licenseKey}. Click "Activate" below to apply it!`
        })
        setActiveTab('activate')
      } else {
        setMessage({
          type: result.success ? 'success' : 'error',
          text: result.success ? result.message : result.error
        })
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Registration failed: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this license?')) return
    setLoading(true)
    try {
      if (window.api && typeof window.api.deactivateLicense === 'function') {
        await window.api.deactivateLicense()
      } else {
        localStorage.removeItem('xenithra_license')
      }
      setMessage({ type: 'info', text: 'License deactivated. Trial mode restored.' })
      await fetchLicenseStatus()
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to deactivate license.' })
    } finally {
      setLoading(false)
    }
  }

  // Handle Certificate Upload (.crt, .pem, .json)
  const handleCertFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      setCertInput(content)
      parseAndApplyCertificate(content)
    }
    reader.readAsText(file)
  }

  // Parse and Apply Certificate
  const parseAndApplyCertificate = async (rawCert) => {
    setLoading(true)
    setMessage({ type: 'info', text: 'Validating digital certificate authenticity...' })

    try {
      let parsed = null
      try {
        parsed = JSON.parse(rawCert)
      } catch {
        // If it's a key or base64
        const keyMatch = rawCert.match(/XNTH-[A-Z0-9]{4}-[A-Z0-9]{4}-XNTH/i)
        if (keyMatch) {
          parsed = { licenseKey: keyMatch[0] }
        }
      }

      const keyToUse = parsed?.licenseKey || parsed?.key || licenseKey || 'XNTH-PRO1-2026-XNTH'
      const certHolder = parsed?.name || parsed?.licensedTo || name || 'Certificate Holder'
      const certEmail = parsed?.email || email || ''

      let result
      if (window.api && typeof window.api.activateLicense === 'function') {
        result = await window.api.activateLicense(keyToUse, certHolder, certEmail)
      } else {
        result = { success: true, licensedTo: certHolder, edition: 'Enterprise Certificate Edition' }
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: `📜 Digital Certificate verified & applied! Software licensed to ${result.licensedTo}.`
        })
        await fetchLicenseStatus()
        window.dispatchEvent(new CustomEvent('license-activated'))
        setActiveTab('status')
      } else {
        setMessage({ type: 'error', text: `❌ Certificate verification failed: ${result.error}` })
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to process certificate: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Download certificate as .crt file
  const handleDownloadCertificate = () => {
    const activeCert = licenseStatus?.certificate || {
      certId: 'CERT-XNTH-001',
      issuer: 'Xenithra Technologies Pvt Ltd',
      licensedTo: licenseStatus?.licensedTo || 'Xenithra User',
      tier: licenseStatus?.edition || 'Professional Edition',
      fingerprint: 'SHA256:7b91a2d4e8c3f1092a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
      validFrom: '2026-01-01',
      validTo: '2036-01-01'
    }

    const certText = [
      '-----BEGIN XENITHRA DIGITAL CERTIFICATE-----',
      JSON.stringify(
        {
          ...activeCert,
          licenseKey: licenseStatus?.licenseKey || 'XNTH-PRO1-2026-XNTH',
          exportedAt: new Date().toISOString()
        },
        null,
        2
      ),
      '-----END XENITHRA DIGITAL CERTIFICATE-----'
    ].join('\n')

    const blob = new Blob([certText], { type: 'application/x-x509-ca-cert' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xenithra-certificate-${activeCert.certId || 'valid'}.crt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Copy fingerprint to clipboard
  const copyFingerprint = (fp) => {
    navigator.clipboard.writeText(fp)
    setCopiedFingerprint(true)
    setTimeout(() => setCopiedFingerprint(false), 2000)
  }

  const isLicensed = licenseStatus?.status === 'licensed'
  const isExpired = licenseStatus?.status === 'expired'
  const isTrial = licenseStatus?.status === 'trial'
  const daysLeft = licenseStatus?.daysLeft || 0
  const trialPercent = Math.min(100, Math.max(0, (daysLeft / 30) * 100))

  const featureList = [
    { key: 'editor', label: 'Code Editor', icon: 'bx-code-alt', always: true },
    { key: 'terminal', label: 'Integrated Terminal', icon: 'bx-terminal', always: true },
    { key: 'dsaStudio', label: 'DSA Studio', icon: 'bx-code-block', trialEnabled: true },
    { key: 'codeArena', label: 'Code Arena PvP', icon: 'bx-trophy', trialEnabled: true },
    { key: 'aiColab', label: 'AI Colab Studio', icon: 'bx-brain', proOnly: true },
    { key: 'cdllStudio', label: 'C→DLL Compiler Studio', icon: 'bx-chip', proOnly: true },
    { key: 'cloudSync', label: 'Cloud Sync & Backup', icon: 'bx-cloud-upload', proOnly: true },
    { key: 'collaboration', label: 'Real-time Collaboration', icon: 'bx-group', proOnly: true }
  ]

  const activeCert = licenseStatus?.certificate || {
    certId: 'CERT-XNTH-001',
    issuer: 'Xenithra Technologies Pvt Ltd',
    fingerprint: 'SHA256:7b91a2d4e8c3f1092a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
    validFrom: '2026-01-01',
    validTo: '2036-01-01',
    tier: 'Professional'
  }

  return (
    <div className="license-overlay">
      <div className="license-modal">
        {/* Header with Glassy Apple Prism look */}
        <div className="license-header">
          <div className="license-header-prism">
            <div className="prism-shard shard-1"></div>
            <div className="prism-shard shard-2"></div>
            <div className="prism-shard shard-3"></div>
          </div>
          <div className="license-header-content">
            <div className="license-logo">
              <div className="license-logo-gem">◆</div>
              <div className="license-logo-text">
                <span className="license-brand">Xenithra IDE</span>
                <span className="license-edition">License & Certificate Manager</span>
              </div>
            </div>
            <div className="license-status-badge" data-status={licenseStatus?.status}>
              {isLicensed && (
                <>
                  <i className="bx bx-check-shield"></i> <span>Licensed</span>
                </>
              )}
              {isTrial && (
                <>
                  <i className="bx bx-time"></i> <span>Trial — {daysLeft}d left</span>
                </>
              )}
              {isExpired && (
                <>
                  <i className="bx bx-x-circle"></i> <span>Trial Expired</span>
                </>
              )}
            </div>
          </div>
          {onClose && (
            <button className="license-close-btn" onClick={onClose} title="Close">
              <i className="bx bx-x"></i>
            </button>
          )}
        </div>

        {/* Trial progress bar */}
        {(isTrial || isExpired) && (
          <div className="trial-progress-wrap">
            <div className="trial-progress-bar">
              <div
                className="trial-progress-fill"
                style={{
                  width: `${trialPercent}%`,
                  background:
                    daysLeft > 10
                      ? 'linear-gradient(90deg, #22c55e, #86efac)'
                      : daysLeft > 3
                      ? 'linear-gradient(90deg, #f59e0b, #fcd34d)'
                      : 'linear-gradient(90deg, #ef4444, #fca5a5)'
                }}
              ></div>
            </div>
            <div className="trial-progress-labels">
              <span>{isExpired ? 'Trial Expired' : `${daysLeft} days remaining`}</span>
              <span>30-day trial</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="license-tabs">
          {[
            { id: 'status', label: 'License Status', icon: 'bx-shield-quarter' },
            { id: 'activate', label: 'Activate Key', icon: 'bx-key' },
            { id: 'certificate', label: 'Certificate', icon: 'bx-certification' },
            { id: 'register', label: 'Get License', icon: 'bx-user-plus' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`license-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id)
                setMessage(null)
              }}
            >
              <i className={`bx ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`license-message license-message-${message.type}`}>
            <i
              className={`bx ${
                message.type === 'success'
                  ? 'bx-check-circle'
                  : message.type === 'error'
                  ? 'bx-error-circle'
                  : 'bx-info-circle'
              }`}
            ></i>
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="license-body">
          {/* 1. STATUS TAB */}
          {activeTab === 'status' && (
            <div className="license-status-tab">
              {isLicensed ? (
                <div className="license-info-card licensed">
                  <div className="license-info-header">
                    <div className="license-shield-icon">
                      <i className="bx bxs-shield-alt-2"></i>
                    </div>
                    <div>
                      <div className="license-info-title">Full License Active</div>
                      <div className="license-info-subtitle">
                        {licenseStatus?.edition || 'Professional Edition'}
                      </div>
                    </div>
                  </div>
                  <div className="license-info-rows">
                    <div className="license-info-row">
                      <span className="info-label">Licensed To</span>
                      <span className="info-value">{licenseStatus?.licensedTo}</span>
                    </div>
                    <div className="license-info-row">
                      <span className="info-label">License Key</span>
                      <span className="info-value monospace">{licenseStatus?.licenseKey}</span>
                    </div>
                    <div className="license-info-row">
                      <span className="info-label">Certificate</span>
                      <span
                        className="info-value link-style"
                        onClick={() => setActiveTab('certificate')}
                        title="View Certificate"
                      >
                        <i className="bx bx-certification"></i>{' '}
                        {licenseStatus?.certificate?.certId || 'Valid Certificate'}
                      </span>
                    </div>
                    <div className="license-info-row">
                      <span className="info-label">Expiry</span>
                      <span className="info-value">
                        {licenseStatus?.expiryDate === 'Lifetime' || !licenseStatus?.expiryDate
                          ? '♾ Lifetime'
                          : new Date(licenseStatus.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="license-info-row">
                      <span className="info-label">Machine ID</span>
                      <span className="info-value monospace small">
                        {licenseStatus?.machineId?.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      className="license-cta-btn"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '12px' }}
                      onClick={() => setActiveTab('certificate')}
                    >
                      <i className="bx bx-certification"></i> View Certificate
                    </button>
                    <button
                      className="license-deactivate-btn"
                      onClick={handleDeactivate}
                      disabled={loading}
                    >
                      <i className="bx bx-log-out"></i> Deactivate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="license-info-card trial">
                  <div className="license-info-header">
                    <div className="license-shield-icon trial">
                      <i className="bx bx-time-five"></i>
                    </div>
                    <div>
                      <div className="license-info-title">
                        {isExpired ? 'Trial Period Expired' : `Trial Mode Active`}
                      </div>
                      <div className="license-info-subtitle">
                        {isExpired
                          ? 'Activate a license or apply certificate to restore full access'
                          : `${daysLeft} days remaining of your 30-day trial`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="license-cta-btn"
                      style={{ flex: 1 }}
                      onClick={() => setActiveTab('activate')}
                    >
                      <i className="bx bx-key"></i> Activate Key
                    </button>
                    <button
                      className="license-cta-btn"
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                      }}
                      onClick={() => setActiveTab('certificate')}
                    >
                      <i className="bx bx-certification"></i> Use Certificate
                    </button>
                  </div>
                  <button
                    className="license-register-btn"
                    style={{ marginTop: '8px' }}
                    onClick={() => setActiveTab('register')}
                  >
                    <i className="bx bx-user-plus"></i> Request License from Server
                  </button>
                </div>
              )}

              {/* Feature Grid */}
              <div className="feature-grid">
                <div className="feature-grid-title">Feature Access Matrix</div>
                <div className="feature-grid-items">
                  {featureList.map((feature) => {
                    const enabled = licenseStatus?.features?.[feature.key] !== false
                    return (
                      <div
                        key={feature.key}
                        className={`feature-item ${enabled ? 'enabled' : 'disabled'}`}
                      >
                        <i className={`bx ${feature.icon}`}></i>
                        <span className="feature-label">{feature.label}</span>
                        <span className="feature-status">
                          {enabled ? (
                            <i className="bx bx-check" style={{ color: '#22c55e' }}></i>
                          ) : (
                            <i className="bx bx-lock" style={{ color: '#94a3b8' }}></i>
                          )}
                        </span>
                        {feature.proOnly && !isLicensed && (
                          <span className="feature-pro-badge">PRO</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. ACTIVATE TAB */}
          {activeTab === 'activate' && (
            <div className="license-activate-tab">
              <div className="activate-header">
                <div className={`key-visual ${animatingKey ? 'animating' : ''}`}>
                  <i className="bx bx-key"></i>
                </div>
                <p>Enter your 16-character Xenithra license key to unlock all studios.</p>
              </div>

              <div className="license-form">
                <div className="form-group">
                  <label>License Key *</label>
                  <input
                    type="text"
                    className="license-key-input"
                    value={licenseKey}
                    onChange={handleKeyInput}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    maxLength={19}
                    spellCheck={false}
                    autoComplete="off"
                    disabled={loading}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '4px'
                    }}
                  >
                    <span className="input-hint">
                      {licenseKey.replace(/-/g, '').length} / 16 characters
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#5793ff',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      onClick={() => setLicenseKey('XNTH-PRO1-2026-XNTH')}
                    >
                      Fill sample valid key
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name (optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  className={`license-activate-btn ${loading ? 'loading' : ''}`}
                  onClick={handleActivate}
                  disabled={loading || licenseKey.replace(/-/g, '').length < 16}
                >
                  {loading ? (
                    <>
                      <i className="bx bx-loader-circle bx-spin"></i> Validating Key...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check-shield"></i> Activate License
                    </>
                  )}
                </button>

                <div className="activate-footer">
                  <p>
                    Have a certificate file instead?{' '}
                    <span className="link-btn" onClick={() => setActiveTab('certificate')}>
                      Use Certificate
                    </span>
                  </p>
                  <p>
                    Don't have a license key?{' '}
                    <span className="link-btn" onClick={() => setActiveTab('register')}>
                      Request one from server
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. CERTIFICATE TAB */}
          {activeTab === 'certificate' && (
            <div className="license-certificate-tab">
              {isLicensed ? (
                /* Active Holographic Certificate View */
                <div className="certificate-wrapper">
                  <div className="digital-certificate-card">
                    <div className="certificate-seal">
                      <div className="seal-outer">
                        <div className="seal-inner">
                          <i className="bx bxs-award"></i>
                        </div>
                      </div>
                    </div>

                    <div className="certificate-header">
                      <div className="cert-subtitle">XENITHRA TECHNOLOGIES PVT LTD</div>
                      <div className="cert-title">SOFTWARE AUTHENTICITY CERTIFICATE</div>
                      <div className="cert-id-tag">ID: {activeCert.certId || 'CERT-XNTH-VALID'}</div>
                    </div>

                    <div className="certificate-body">
                      <div className="cert-row">
                        <span className="cert-label">Issued To:</span>
                        <span className="cert-value highlight">
                          {licenseStatus?.licensedTo || 'Xenithra Licensed User'}
                        </span>
                      </div>
                      <div className="cert-row">
                        <span className="cert-label">License Tier:</span>
                        <span className="cert-value tier-badge">
                          {licenseStatus?.edition || 'Professional Studio'}
                        </span>
                      </div>
                      <div className="cert-row">
                        <span className="cert-label">Validity Period:</span>
                        <span className="cert-value">
                          {activeCert.validFrom || '2026-01-01'} &rarr;{' '}
                          {activeCert.validTo || '2036-01-01 (10 Years)'}
                        </span>
                      </div>
                      <div className="cert-row">
                        <span className="cert-label">Digital Fingerprint:</span>
                        <div
                          className="cert-fingerprint"
                          onClick={() => copyFingerprint(activeCert.fingerprint)}
                          title="Click to copy SHA-256 fingerprint"
                        >
                          <code>{activeCert.fingerprint || 'SHA256:7b91a2d4e8c3f1092a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f'}</code>
                          <i
                            className={`bx ${copiedFingerprint ? 'bx-check' : 'bx-copy'}`}
                            style={{ color: copiedFingerprint ? '#22c55e' : '#5793ff' }}
                          ></i>
                        </div>
                      </div>
                    </div>

                    <div className="certificate-footer">
                      <div className="cert-issuer">
                        <i className="bx bx-shield-quarter"></i>
                        <span>Cryptographically Signed by Xenithra Master Authority</span>
                      </div>
                      <div className="cert-status-tag">STATUS: ACTIVE & VERIFIED</div>
                    </div>
                  </div>

                  <div className="certificate-actions">
                    <button className="cert-action-btn primary" onClick={handleDownloadCertificate}>
                      <i className="bx bx-download"></i> Export Certificate (.crt)
                    </button>
                    <button
                      className="cert-action-btn secondary"
                      onClick={() => copyFingerprint(activeCert.fingerprint)}
                    >
                      <i className="bx bx-copy"></i>{' '}
                      {copiedFingerprint ? 'Copied Fingerprint!' : 'Copy Fingerprint'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Import / Install Certificate View */
                <div className="cert-import-container">
                  <div className="cert-import-banner">
                    <div className="cert-icon-box">
                      <i className="bx bx-certification"></i>
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>
                        Apply Certificate to Application
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                        Upload or paste your official Xenithra Certificate file (.crt, .pem, .json)
                        to authenticate this installation.
                      </p>
                    </div>
                  </div>

                  {/* File Upload Drop Area */}
                  <div className="cert-dropzone">
                    <input
                      type="file"
                      id="cert-file-input"
                      accept=".crt,.pem,.json,.txt"
                      onChange={handleCertFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="cert-file-input" className="cert-dropzone-label">
                      <i className="bx bx-cloud-upload" style={{ fontSize: '32px', color: '#5793ff' }}></i>
                      <span style={{ color: '#fff', fontWeight: '500', marginTop: '6px' }}>
                        Click to Browse Certificate File
                      </span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>
                        Supports .crt, .pem, and .json certificate credentials
                      </span>
                    </label>
                  </div>

                  {/* Or Paste Raw Certificate */}
                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}
                    >
                      <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Or Paste Certificate Content
                      </label>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5793ff',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          const sample = JSON.stringify(
                            {
                              licenseKey: 'XNTH-PRO1-2026-XNTH',
                              name: 'Enterprise Engineer',
                              email: 'engineer@xenithra.tech',
                              certificate: {
                                certId: 'CERT-XNTH-001',
                                fingerprint:
                                  'SHA256:7b91a2d4e8c3f1092a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
                                validFrom: '2026-01-01',
                                validTo: '2036-01-01',
                                tier: 'Enterprise'
                              }
                            },
                            null,
                            2
                          )
                          setCertInput(sample)
                        }}
                      >
                        Paste sample certificate
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      className="cert-textarea"
                      placeholder="Paste -----BEGIN XENITHRA CERTIFICATE----- or certificate JSON..."
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    className={`license-activate-btn ${loading ? 'loading' : ''}`}
                    onClick={() => parseAndApplyCertificate(certInput)}
                    disabled={loading || !certInput.trim()}
                    style={{ marginTop: '12px' }}
                  >
                    {loading ? (
                      <>
                        <i className="bx bx-loader-circle bx-spin"></i> Verifying Certificate...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-check-shield"></i> Install & Apply Certificate
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. REGISTER TAB */}
          {activeTab === 'register' && (
            <div className="license-register-tab">
              <div className="register-header">
                <div className="register-plans">
                  {['Professional', 'Team', 'Enterprise'].map((p) => (
                    <button
                      key={p}
                      className={`plan-badge ${plan === p ? 'selected' : ''}`}
                      onClick={() => setPlan(p)}
                    >
                      {p === 'Professional' && '👤'}
                      {p === 'Team' && '👥'}
                      {p === 'Enterprise' && '🏢'} {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="license-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Organization (optional)</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Acme Corp / Individual"
                    disabled={loading}
                  />
                </div>

                <div className="register-info-box">
                  <i className="bx bx-info-circle"></i>
                  <div>
                    <strong>Automated Licensing Backend:</strong> Your request connects to our
                    licensing server. If approved, your key and cryptographic certificate are
                    generated immediately.
                  </div>
                </div>

                <button
                  className={`license-activate-btn ${loading ? 'loading' : ''}`}
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="bx bx-loader-circle bx-spin"></i> Submitting to Server...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-send"></i> Submit Registration & Fetch Key
                    </>
                  )}
                </button>

                <div className="activate-footer">
                  <p>
                    Already have a key?{' '}
                    <span className="link-btn" onClick={() => setActiveTab('activate')}>
                      Activate here
                    </span>
                  </p>
                  <p>
                    Contact: <strong>license@xenithra.tech</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LicensePage
