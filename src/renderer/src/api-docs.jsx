import { useState, useEffect, useRef } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'boxicons/css/boxicons.min.css'
import './api-docs.css'

const ApiDocsPage = () => {
  const [activeExampleTab, setActiveExampleTab] = useState('javascript')
  const [stats, setStats] = useState({
    totalEndpoints: 0,
    totalCategories: 0,
    apiVersion: 'v1.0',
    uptime: '99.9%'
  })
  const [categories, setCategories] = useState([])
  const [endpoints, setEndpoints] = useState([])

  // API Test Modal State
  const [showTestModal, setShowTestModal] = useState(false)
  const [testForm, setTestForm] = useState({
    endpoint: '/api/compiler/run',
    method: 'POST',
    headers: '{"Authorization": "Bearer your-token"}',
    body: '{"code": "console.log(\\"Hello World\\");", "language": "javascript"}'
  })
  const [response, setResponse] = useState({
    status: '200 OK',
    time: '150ms',
    body: ''
  })

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')

  // Mock data - replace with your API data
  const mockEndpoints = [
    {
      id: 'compile-run',
      category: 'Compiler',
      method: 'POST',
      path: '/api/compiler/run',
      description: 'Compile and execute code in real-time',
      params: [
        { name: 'code', type: 'string', required: true, description: 'Source code' },
        { name: 'language', type: 'string', required: true, description: 'Programming language' }
      ]
    },
    {
      id: 'user-profile',
      category: 'User',
      method: 'GET',
      path: '/api/user/profile',
      description: 'Get user profile information'
    }
  ]

  const mockCategories = ['Compiler', 'User', 'Analytics', 'Collaboration']

  // Example code snippets
  const exampleSnippets = {
    javascript: `fetch('http://localhost:8000/api/compiler/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    code: 'console.log("Hello World");',
    language: 'javascript'
  })
})`,
    python: `import requests

url = "http://localhost:8000/api/compiler/run"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-jwt-token"
}
data = {
    "code": 'print("Hello World")',
    "language": "python"
}

response = requests.post(url, json=data, headers=headers)`,
    curl: `curl -X POST http://localhost:8000/api/compiler/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{
    "code": "console.log(\\"Hello World\\");",
    "language": "javascript"
  }'`
  }

  useEffect(() => {
    // Load API stats and data
    setStats({
      totalEndpoints: 24,
      totalCategories: 5,
      apiVersion: 'v1.2',
      uptime: '99.95%'
    })
    setCategories(mockCategories)
    setEndpoints(mockEndpoints)
  }, [])

  const handleTestApi = () => {
    setShowTestModal(true)
  }

  const handleExport = () => {
    setShowExportModal(true)
  }

  const sendTestRequest = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setResponse({
        status: '200 OK',
        time: '342ms',
        body: JSON.stringify(
          {
            success: true,
            output: 'Hello World',
            executionTime: 45
          },
          null,
          2
        )
      })
    } catch (error) {
      setResponse({
        status: '500 Internal Server Error',
        time: '120ms',
        body: JSON.stringify({ error: 'Server error' }, null, 2)
      })
    }
  }

  const renderEndpointCard = (endpoint) => (
    <div key={endpoint.id} className="endpoint-card">
      <div className="endpoint-header">
        <span className={`method-badge method-${endpoint.method.toLowerCase()}`}>
          {endpoint.method}
        </span>
        <code>{endpoint.path}</code>
      </div>
      <h5>{endpoint.description}</h5>
      {endpoint.params && (
        <div class="endpoint-params">
          <h6>Parameters:</h6>
          <ul>
            {endpoint.params.map((param) => (
              <li key={param.name}>
                <code>{param.name}</code> ({param.type})
                {param.required && <span className="required">Required</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <div className="api-docs-container">
      {/* Header */}
      <header className="api-docs-header">
        <div className="header-content">
          <h1>
            <i className="bx bx-book"></i> API Documentation
          </h1>
          <p>Complete reference for Node Compiler API</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline-primary" onClick={handleExport}>
            <i className="bx bx-download"></i> Export
          </button>
          <button className="btn btn-primary" onClick={handleTestApi}>
            <i className="bx bx-play"></i> Test API
          </button>
        </div>
      </header>

      {/* API Overview */}
      <div className="api-overview">
        <div className="overview-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.totalEndpoints}</span>
            <span className="stat-label">Endpoints</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.totalCategories}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.apiVersion}</span>
            <span className="stat-label">Version</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.uptime}</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="api-docs-content">
        {/* Sidebar */}
        <div className="api-sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <div className="categories-list">
              {categories.map((category) => (
                <div key={category} className="category-item">
                  {category}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Quick Links</h3>
            <ul className="quick-links">
              <li>
                <a href="#overview">Overview</a>
              </li>
              <li>
                <a href="#authentication">Authentication</a>
              </li>
              <li>
                <a href="#endpoints">Endpoints</a>
              </li>
              <li>
                <a href="#examples">Examples</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Panel */}
        <div className="api-main-panel">
          {/* Overview Section */}
          <section id="overview" className="api-section">
            <h2>API Overview</h2>
            <p>
              The Node Compiler API provides comprehensive endpoints for code compilation, user
              management, collaboration, and analytics.
            </p>

            <div className="api-info-grid">
              <div className="info-card">
                <h4>Base URL</h4>
                <code>http://localhost:8000/api</code>
              </div>
              <div className="info-card">
                <h4>Authentication</h4>
                <p>JWT Bearer tokens required for protected endpoints</p>
              </div>
              <div className="info-card">
                <h4>Response Format</h4>
                <p>JSON with consistent error handling</p>
              </div>
              <div className="info-card">
                <h4>Rate Limiting</h4>
                <p>Varies by endpoint (50-100 requests per 15 minutes)</p>
              </div>
            </div>
          </section>

          {/* Authentication Section */}
          <section id="authentication" className="api-section">
            <h2>Authentication</h2>
            <p>Most API endpoints require authentication using JWT tokens.</p>

            <div className="auth-methods">
              <h3>Getting Started</h3>
              <ol>
                <li>Register a new account or login</li>
                <li>Receive a JWT token in the response</li>
                <li>Include the token in the Authorization header for subsequent requests</li>
              </ol>

              <h3>Example Request</h3>
              <pre>
                <code>Authorization: Bearer your-jwt-token-here</code>
              </pre>
            </div>
          </section>

          {/* Endpoints Section */}
          <section id="endpoints" className="api-section">
            <h2>API Endpoints</h2>
            <div className="endpoints-container">{endpoints.map(renderEndpointCard)}</div>
          </section>

          {/* Examples Section */}
          <section id="examples" className="api-section">
            <h2>Code Examples</h2>
            <div className="examples-tabs">
              <button
                className={`example-tab ${activeExampleTab === 'javascript' ? 'active' : ''}`}
                onClick={() => setActiveExampleTab('javascript')}
              >
                JavaScript
              </button>
              <button
                className={`example-tab ${activeExampleTab === 'python' ? 'active' : ''}`}
                onClick={() => setActiveExampleTab('python')}
              >
                Python
              </button>
              <button
                className={`example-tab ${activeExampleTab === 'curl' ? 'active' : ''}`}
                onClick={() => setActiveExampleTab('curl')}
              >
                cURL
              </button>
            </div>

            <div className="example-content">
              <pre>
                <code>{exampleSnippets[activeExampleTab]}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>

      {/* API Test Modal */}
      <div
        className={`modal fade ${showTestModal ? 'show d-block' : ''}`}
        id="apiTestModal"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">API Endpoint Tester</h5>
              <button type="button" className="btn-close" onClick={() => setShowTestModal(false)} />
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label htmlFor="testEndpoint" className="form-label">
                        Endpoint
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="testEndpoint"
                        value={testForm.endpoint}
                        onChange={(e) => setTestForm({ ...testForm, endpoint: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="testMethod" className="form-label">
                        Method
                      </label>
                      <select
                        className="form-control"
                        id="testMethod"
                        value={testForm.method}
                        onChange={(e) => setTestForm({ ...testForm, method: e.target.value })}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="testHeaders" className="form-label">
                    Headers (JSON)
                  </label>
                  <textarea
                    className="form-control"
                    id="testHeaders"
                    rows="3"
                    value={testForm.headers}
                    onChange={(e) => setTestForm({ ...testForm, headers: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="testBody" className="form-label">
                    Request Body (JSON)
                  </label>
                  <textarea
                    className="form-control"
                    id="testBody"
                    rows="5"
                    value={testForm.body}
                    onChange={(e) => setTestForm({ ...testForm, body: e.target.value })}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowTestModal(false)}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={sendTestRequest}>
                <i className="bx bx-send"></i> Send Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {response.body && (
        <div className="modal fade show d-block" id="responseModal" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">API Response</h5>
                <button type="button" className="btn-close" onClick={() => setResponse({})} />
              </div>
              <div className="modal-body">
                <div className="response-info">
                  <span>Status: {response.status}</span>
                  <span>Time: {response.time}</span>
                </div>
                <pre id="responseBody">{response.body}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <div
        className={`modal fade ${showExportModal ? 'show d-block' : ''}`}
        id="exportModal"
        tabIndex="-1"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Export API Documentation</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowExportModal(false)}
              />
            </div>
            <div className="modal-body">
              <div className="export-options">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="jsonExport"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="jsonExport">
                    JSON Format
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="exportFormat"
                    id="textExport"
                    value="text"
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="textExport">
                    Text Format
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                <i className="bx bx-download"></i> Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDocsPage
