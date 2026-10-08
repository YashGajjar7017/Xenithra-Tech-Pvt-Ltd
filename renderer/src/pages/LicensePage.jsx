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
              editor: true, terminal: true, aiColab: false,
              dsaStudio: true, cdllStudio: false, codeArena: true,
              cloudSync: false, collaboration: false
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
        await new Promise(r => setTimeout(r, 1800))
        result = { success: true, licensedTo: name || 'Xenithra User', edition: 'Professional' }
        localStorage.setItem('xenithra_license', JSON.stringify({
          status: 'licensed', type: 'full', licensedTo: name || 'Xenithra User',
          licenseKey, edition: 'Professional',
          features: {
            editor: true, terminal: true, aiColab: true, dsaStudio: true,
            cdllStudio: true, codeArena: true, cloudSync: true, collaboration: true
          }
        }))
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
    setMessage({ type: 'info', text: 'Submitting registration request...' })

    try {
      let result
      if (window.api && typeof window.api.submitLicenseRegistration === 'function') {
        result = await window.api.submitLicenseRegistration(name, email, organization, plan)
      } else {
        await new Promise(r => setTimeout(r, 1500))
        result = { success: true, message: 'Registration submitted! Check your email within 24 hours.' }
      }

      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.success ? result.message : result.error
      })
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

  return (
    <div className="license-overlay">
      <div className="license-modal">
        {/* Header */}
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
                <span className="license-edition">License Manager</span>
              </div>
            </div>
            <div className="license-status-badge" data-status={licenseStatus?.status}>
              {isLicensed && (
                <><i className="bx bx-check-shield"></i> <span>Licensed</span></>
              )}
              {isTrial && (
                <><i className="bx bx-time"></i> <span>Trial — {daysLeft}d left</span></>
              )}
              {isExpired && (
                <><i className="bx bx-x-circle"></i> <span>Trial Expired</span></>
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
                  background: daysLeft > 10
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

        {/* Tabs */}
        <div className="license-tabs">
          {[
            { id: 'status', label: 'License Status', icon: 'bx-shield-quarter' },
            { id: 'activate', label: 'Activate', icon: 'bx-key' },
            { id: 'register', label: 'Get License', icon: 'bx-user-plus' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`license-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setMessage(null) }}
            >
              <i className={`bx ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`license-message license-message-${message.type}`}>
            <i className={`bx ${
              message.type === 'success' ? 'bx-check-circle' :
              message.type === 'error' ? 'bx-error-circle' : 'bx-info-circle'
            }`}></i>
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="license-body">

          {/* STATUS TAB */}
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
                      <div className="license-info-subtitle">{licenseStatus?.edition || 'Professional Edition'}</div>
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
                  <button className="license-deactivate-btn" onClick={handleDeactivate} disabled={loading}>
                    <i className="bx bx-log-out"></i> Deactivate License
                  </button>
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
                          ? 'Activate a license to restore full access'
                          : `${daysLeft} days remaining of your 30-day trial`}
                      </div>
                    </div>
                  </div>
                  <button
                    className="license-cta-btn"
                    onClick={() => setActiveTab('activate')}
                  >
                    <i className="bx bx-key"></i> Activate License Now
                  </button>
                  <button
                    className="license-register-btn"
                    onClick={() => setActiveTab('register')}
                  >
                    <i className="bx bx-user-plus"></i> Get a License Key
                  </button>
                </div>
              )}

              {/* Feature Grid */}
              <div className="feature-grid">
                <div className="feature-grid-title">Feature Access</div>
                <div className="feature-grid-items">
                  {featureList.map(feature => {
                    const enabled = licenseStatus?.features?.[feature.key] !== false
                    return (
                      <div
                        key={feature.key}
                        className={`feature-item ${enabled ? 'enabled' : 'disabled'}`}
                      >
                        <i className={`bx ${feature.icon}`}></i>
                        <span className="feature-label">{feature.label}</span>
                        <span className="feature-status">
                          {enabled
                            ? <i className="bx bx-check" style={{ color: '#22c55e' }}></i>
                            : <i className="bx bx-lock" style={{ color: '#94a3b8' }}></i>}
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

          {/* ACTIVATE TAB */}
          {activeTab === 'activate' && (
            <div className="license-activate-tab">
              <div className="activate-header">
                <div className={`key-visual ${animatingKey ? 'animating' : ''}`}>
                  <i className="bx bx-key"></i>
                </div>
                <p>Enter your Xenithra IDE license key to unlock all features.</p>
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
                  <span className="input-hint">
                    {licenseKey.replace(/-/g, '').length} / 16 characters
                  </span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name (optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email (optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
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
                    <><i className="bx bx-loader-circle bx-spin"></i> Validating...</>
                  ) : (
                    <><i className="bx bx-check-shield"></i> Activate License</>
                  )}
                </button>

                <div className="activate-footer">
                  <p>Don't have a license key?{' '}
                    <span className="link-btn" onClick={() => setActiveTab('register')}>
                      Request one here
                    </span>
                  </p>
                  <p>License keys are validated against the Xenithra GitHub registry.</p>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <div className="license-register-tab">
              <div className="register-header">
                <div className="register-plans">
                  {['Professional', 'Team', 'Enterprise'].map(p => (
                    <button
                      key={p}
                      className={`plan-badge ${plan === p ? 'selected' : ''}`}
                      onClick={() => setPlan(p)}
                    >
                      {p === 'Professional' && '👤'}
                      {p === 'Team' && '👥'}
                      {p === 'Enterprise' && '🏢'}
                      {' '}{p}
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
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="Acme Corp / Individual"
                    disabled={loading}
                  />
                </div>

                <div className="register-info-box">
                  <i className="bx bx-info-circle"></i>
                  <div>
                    <strong>How it works:</strong> Your request will be submitted to our GitHub
                    repository. We'll review and send your license key to the provided email
                    within 24 hours. For instant access, contact{' '}
                    <strong>license@xenithra.tech</strong>.
                  </div>
                </div>

                <button
                  className={`license-activate-btn ${loading ? 'loading' : ''}`}
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <><i className="bx bx-loader-circle bx-spin"></i> Submitting...</>
                  ) : (
                    <><i className="bx bx-send"></i> Submit Registration Request</>
                  )}
                </button>

                <div className="activate-footer">
                  <p>Already have a key?{' '}
                    <span className="link-btn" onClick={() => setActiveTab('activate')}>
                      Activate here
                    </span>
                  </p>
                  <p>Contact: <strong>license@xenithra.tech</strong></p>
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
