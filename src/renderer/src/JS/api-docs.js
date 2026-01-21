// API Documentation JavaScript
document.addEventListener('DOMContentLoaded', function () {
  initializeApiDocs()
  loadApiDocsData()
  setupEventListeners()
})

function initializeApiDocs() {
  // Check authentication
  const token = getCookie('token')
  if (!token) {
    window.location.href = '/Account/login'
    return
  }
}

function setupEventListeners() {
  // Export button
  const exportBtn = document.getElementById('exportBtn')
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      const modal = new bootstrap.Modal(document.getElementById('exportModal'))
      modal.show()
    })
  }

  // Test API button
  const testApiBtn = document.getElementById('testApiBtn')
  if (testApiBtn) {
    testApiBtn.addEventListener('click', function () {
      const modal = new bootstrap.Modal(document.getElementById('apiTestModal'))
      modal.show()
    })
  }

  // Export confirm
  const confirmExportBtn = document.getElementById('confirmExportBtn')
  if (confirmExportBtn) {
    confirmExportBtn.addEventListener('click', exportDocumentation)
  }

  // Send test request
  const sendTestRequestBtn = document.getElementById('sendTestRequestBtn')
  if (sendTestRequestBtn) {
    sendTestRequestBtn.addEventListener('click', sendTestRequest)
  }

  // Example tabs
  const exampleTabs = document.querySelectorAll('.example-tab')
  exampleTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const lang = this.getAttribute('data-lang')
      switchExampleTab(lang)
    })
  })

  // Category filtering
  setupCategoryFiltering()
}

function loadApiDocsData() {
  // Load endpoints
  fetch('/api/docs/endpoints', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateApiDocs(data.data)
      }
    })
    .catch((error) => console.error('Error loading API docs:', error))

  // Load categories
  fetch('/api/docs/categories', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateCategories(data.data)
      }
    })
    .catch((error) => console.error('Error loading categories:', error))
}

function updateApiDocs(data) {
  // Update stats
  document.getElementById('totalEndpoints').textContent = data.totalEndpoints || 0
  document.getElementById('totalCategories').textContent = data.categories?.length || 0
  document.getElementById('apiVersion').textContent = data.version || 'v1.0'
  document.getElementById('uptime').textContent = data.uptime || '99.9%'

  // Update endpoints
  const endpointsContainer = document.getElementById('endpointsContainer')
  if (endpointsContainer && data.endpoints) {
    endpointsContainer.innerHTML = data.endpoints
      .map(
        (endpoint) => `
            <div class="endpoint-item" data-category="${endpoint.category}">
                <div class="endpoint-header" onclick="toggleEndpointDetails(this)">
                    <div class="endpoint-method ${endpoint.method}">${endpoint.method}</div>
                    <div class="endpoint-title">${endpoint.path}</div>
                    <div class="endpoint-toggle"><i class='bx bx-chevron-down'></i></div>
                </div>
                <div class="endpoint-details">
                    <div class="endpoint-description">${endpoint.description}</div>
                    ${
                      endpoint.parameters
                        ? `
                        <div class="endpoint-params">
                            <h5><i class='bx bx-list-ul'></i> Parameters</h5>
                            ${endpoint.parameters
                              .map(
                                (param) => `
                                <div class="param-item">
                                    <div class="param-name">${param.name}</div>
                                    <div class="param-type">${param.type}</div>
                                    <div class="param-description">${param.description}</div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    `
                        : ''
                    }
                    <div class="endpoint-response">
                        <h5><i class='bx bx-check-circle'></i> Response</h5>
                        <div class="response-item">
                            <div class="param-name">Success Response</div>
                            <div class="param-type">${endpoint.responseCode || '200 OK'}</div>
                            <div class="param-description">Returns ${endpoint.responseType || 'JSON data'}</div>
                        </div>
                    </div>
                    ${
                      endpoint.example
                        ? `
                        <div class="code-example">
                            <pre><code>${endpoint.example}</code></pre>
                        </div>
                    `
                        : ''
                    }
                </div>
            </div>
        `
      )
      .join('')
  }

  // Load examples
  loadExamples(data.endpoints)
}

function updateCategories(categories) {
  const categoriesList = document.getElementById('categoriesList')
  if (!categoriesList || !categories) return

  categoriesList.innerHTML = categories
    .map(
      (category) => `
        <div class="category-item" onclick="filterByCategory('${category.id}')">
            ${category.name} (${category.count})
        </div>
    `
    )
    .join('')
}

function loadExamples(endpoints) {
  const exampleContent = document.getElementById('exampleContent')
  if (!exampleContent) return

  // Group examples by language
  const examples = {
    javascript: generateJavaScriptExamples(endpoints),
    python: generatePythonExamples(endpoints),
    curl: generateCurlExamples(endpoints)
  }

  // Store examples for tab switching
  window.apiExamples = examples

  // Show default tab (JavaScript)
  switchExampleTab('javascript')
}

function generateJavaScriptExamples(endpoints) {
  if (!endpoints || endpoints.length === 0) return 'No examples available'

  return endpoints
    .slice(0, 3)
    .map(
      (endpoint) => `
        <h6>${endpoint.method} ${endpoint.path}</h6>
        <pre><code>// ${endpoint.description}
fetch('${endpoint.path}', {
    method: '${endpoint.method}',
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    }${
      endpoint.method !== 'GET'
        ? `,
    body: JSON.stringify({
        // request body
    })`
        : ''
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));</code></pre>
    `
    )
    .join('<hr>')
}

function generatePythonExamples(endpoints) {
  if (!endpoints || endpoints.length === 0) return 'No examples available'

  return endpoints
    .slice(0, 3)
    .map(
      (endpoint) => `
        <h6>${endpoint.method} ${endpoint.path}</h6>
        <pre><code>import requests

# ${endpoint.description}
url = "${endpoint.path}"
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${
        endpoint.method !== 'GET'
          ? `,
    json={
        # request body
    }`
          : ''
      })

print(response.json())</code></pre>
    `
    )
    .join('<hr>')
}

function generateCurlExamples(endpoints) {
  if (!endpoints || endpoints.length === 0) return 'No examples available'

  return endpoints
    .slice(0, 3)
    .map(
      (endpoint) => `
        <h6>${endpoint.method} ${endpoint.path}</h6>
        <pre><code># ${endpoint.description}
curl -X ${endpoint.method} "${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"${
    endpoint.method !== 'GET'
      ? ` \\
  -d '{
    # request body
  }'`
      : ''
  }</code></pre>
    `
    )
    .join('<hr>')
}

function switchExampleTab(lang) {
  const exampleTabs = document.querySelectorAll('.example-tab')
  const exampleContent = document.getElementById('exampleContent')

  // Update active tab
  exampleTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.getAttribute('data-lang') === lang)
  })

  // Update content
  if (exampleContent && window.apiExamples) {
    exampleContent.innerHTML = window.apiExamples[lang] || 'No examples available'
  }
}

function setupCategoryFiltering() {
  // Category item clicks are handled inline
}

function filterByCategory(categoryId) {
  const categoryItems = document.querySelectorAll('.category-item')
  const endpointItems = document.querySelectorAll('.endpoint-item')

  // Update active category
  categoryItems.forEach((item) => {
    item.classList.toggle('active', item.textContent.includes(categoryId))
  })

  // Filter endpoints
  if (categoryId === 'all') {
    endpointItems.forEach((item) => (item.style.display = 'block'))
  } else {
    endpointItems.forEach((item) => {
      const itemCategory = item.getAttribute('data-category')
      item.style.display = itemCategory === categoryId ? 'block' : 'none'
    })
  }
}

function toggleEndpointDetails(header) {
  const details = header.nextElementSibling
  const toggle = header.querySelector('.endpoint-toggle')

  if (details.style.display === 'block') {
    details.style.display = 'none'
    toggle.classList.remove('rotated')
  } else {
    details.style.display = 'block'
    toggle.classList.add('rotated')
  }
}

function exportDocumentation() {
  const exportFormat = document.querySelector('input[name="exportFormat"]:checked').value

  fetch(`/api/docs/export?format=${exportFormat}`, {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => {
      if (exportFormat === 'json') {
        return response.json().then((data) => {
          downloadFile(JSON.stringify(data, null, 2), 'api-docs.json', 'application/json')
        })
      } else {
        return response.text().then((data) => {
          downloadFile(data, 'api-docs.txt', 'text/plain')
        })
      }
    })
    .then(() => {
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'))
      modal.hide()

      showNotification('Documentation exported successfully!', 'success')
    })
    .catch((error) => {
      console.error('Error exporting documentation:', error)
      showNotification('Error exporting documentation. Please try again.', 'error')
    })
}

function sendTestRequest() {
  const form = document.getElementById('apiTestForm')
  const formData = new FormData(form)

  const endpoint = formData.get('testEndpoint')
  const method = formData.get('testMethod')
  const headers = formData.get('testHeaders')
  const body = formData.get('testBody')

  let requestHeaders = {
    Authorization: 'Bearer ' + getCookie('token')
  }

  // Parse custom headers
  if (headers) {
    try {
      const customHeaders = JSON.parse(headers)
      requestHeaders = { ...requestHeaders, ...customHeaders }
    } catch (e) {
      showNotification('Invalid JSON in headers', 'error')
      return
    }
  }

  let requestBody = null
  if (body && method !== 'GET') {
    try {
      requestBody = JSON.parse(body)
    } catch (e) {
      showNotification('Invalid JSON in request body', 'error')
      return
    }
  }

  // Show loading
  const sendBtn = document.getElementById('sendTestRequestBtn')
  const originalText = sendBtn.innerHTML
  sendBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Sending..."
  sendBtn.disabled = true

  const startTime = Date.now()

  fetch(endpoint, {
    method: method,
    headers: requestHeaders,
    body: requestBody ? JSON.stringify(requestBody) : null
  })
    .then((response) => {
      const endTime = Date.now()
      const responseTime = endTime - startTime

      return response.text().then((text) => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
        time: responseTime
      }))
    })
    .then((result) => {
      showTestResponse(result)
    })
    .catch((error) => {
      console.error('Error sending test request:', error)
      showNotification('Error sending request. Please check the endpoint and try again.', 'error')
    })
    .finally(() => {
      sendBtn.innerHTML = originalText
      sendBtn.disabled = false
    })
}

function showTestResponse(result) {
  // Close test modal
  const testModal = bootstrap.Modal.getInstance(document.getElementById('apiTestModal'))
  testModal.hide()

  // Show response modal
  const responseModal = new bootstrap.Modal(document.getElementById('responseModal'))
  const responseStatus = document.getElementById('responseStatus')
  const responseTime = document.getElementById('responseTime')
  const responseBody = document.getElementById('responseBody')

  responseStatus.textContent = `Status: ${result.status} ${result.statusText}`
  responseTime.textContent = `Time: ${result.time}ms`

  try {
    const jsonBody = JSON.parse(result.body)
    responseBody.textContent = JSON.stringify(jsonBody, null, 2)
  } catch (e) {
    responseBody.textContent = result.body
  }

  responseModal.show()
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

function showNotification(message, type = 'info') {
  // Simple notification - you might want to use a proper notification library
  alert(message)
}

// Make functions globally available
window.toggleEndpointDetails = toggleEndpointDetails
window.filterByCategory = filterByCategory
