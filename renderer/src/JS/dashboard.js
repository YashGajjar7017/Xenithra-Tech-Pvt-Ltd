// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // Initialize dashboard
  initializeDashboard()

  // Navigation
  setupNavigation()

  // Load initial data
  loadDashboardData()
})

function initializeDashboard() {
  // Check authentication
  const token = getCookie('token')
  if (!token) {
    window.location.href = '/Account/login'
    return
  }

  // Update username
  const username = getCookie('username')
  if (username) {
    document.getElementById('username').textContent = username
  }
}

function setupNavigation() {
  // Sidebar menu items
  const menuItems = document.querySelectorAll('.menu-item')
  menuItems.forEach((item) => {
    item.addEventListener('click', function () {
      const page = this.getAttribute('data-page')

      // Update active menu item
      menuItems.forEach((mi) => mi.classList.remove('active'))
      this.classList.add('active')

      // Show corresponding page
      showPage(page)
    })
  })

  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle')
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      const sidebar = document.querySelector('.sidebar')
      sidebar.classList.toggle('collapsed')
    })
  }
}

function showPage(pageName) {
  // Hide all pages
  const pages = document.querySelectorAll('.page')
  pages.forEach((page) => page.classList.remove('active'))

  // Show selected page
  const targetPage = document.getElementById(pageName + 'Page')
  if (targetPage) {
    targetPage.classList.add('active')
    document.getElementById('pageTitle').textContent =
      pageName.charAt(0).toUpperCase() + pageName.slice(1)
  }

  // Load page-specific data
  loadPageData(pageName)
}

function loadDashboardData() {
  // Load overview data
  loadOverviewData()

  // Load recent activity
  loadRecentActivity()
}

function loadOverviewData() {
  fetch('/api/dashboard/overview', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateOverviewStats(data.data)
      }
    })
    .catch((error) => console.error('Error loading overview data:', error))
}

function updateOverviewStats(data) {
  document.getElementById('totalCompilations').textContent = data.totalCompilations || 0
  document.getElementById('totalAchievements').textContent = data.totalAchievements || 0
  document.getElementById('activeSessions').textContent = data.activeSessions || 0
  document.getElementById('codingStreak').textContent = data.codingStreak || 0
}

function loadRecentActivity() {
  fetch('/api/dashboard/activity', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateRecentActivity(data.data)
      }
    })
    .catch((error) => console.error('Error loading recent activity:', error))
}

function updateRecentActivity(activities) {
  const activityList = document.getElementById('recentActivity')
  if (!activities || activities.length === 0) {
    return
  }

  activityList.innerHTML = activities
    .map(
      (activity) => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class='bx bx-code-alt'></i>
            </div>
            <div class="activity-content">
                <p>${activity.description}</p>
                <small>${formatDate(activity.timestamp)}</small>
            </div>
        </div>
    `
    )
    .join('')
}

function loadPageData(pageName) {
  switch (pageName) {
    case 'analytics':
      loadAnalyticsData()
      break
    case 'achievements':
      loadAchievementsData()
      break
    case 'collaboration':
      loadCollaborationData()
      break
    case 'api-docs':
      loadApiDocsData()
      break
  }
}

function loadAnalyticsData() {
  // Load compilation statistics
  fetch('/api/analytics/compilations', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateAnalyticsCharts(data.data)
      }
    })
    .catch((error) => console.error('Error loading analytics data:', error))
}

function updateAnalyticsCharts(data) {
  // This would integrate with Chart.js for visualizations
  // For now, just update basic stats
  if (data.compilationStats) {
    // Update chart data here
    console.log('Analytics data loaded:', data)
  }
}

function loadAchievementsData() {
  fetch('/api/achievements', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateAchievements(data.data)
      }
    })
    .catch((error) => console.error('Error loading achievements:', error))
}

function updateAchievements(data) {
  const achievementsGrid = document.getElementById('achievementsGrid')
  if (!achievementsGrid || !data.achievements) return

  achievementsGrid.innerHTML = data.achievements
    .map(
      (achievement) => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">
                <i class='bx bx-trophy'></i>
            </div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            <div class="achievement-progress">
                <div class="progress-bar" style="width: ${achievement.progress}%"></div>
            </div>
            <div class="achievement-points">${achievement.points} points</div>
        </div>
    `
    )
    .join('')

  // Update stats
  document.getElementById('unlockedCount').textContent = data.unlockedCount || 0
  document.getElementById('totalPoints').textContent = data.totalPoints || 0
}

function loadCollaborationData() {
  fetch('/api/collaboration/sessions', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateCollaborationSessions(data.data)
      }
    })
    .catch((error) => console.error('Error loading collaboration data:', error))
}

function updateCollaborationSessions(data) {
  const sessionsList = document.getElementById('sessionsList')
  if (!sessionsList || !data.sessions) return

  if (data.sessions.length === 0) {
    sessionsList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-group'></i>
                <h3>No sessions yet</h3>
                <p>Create your first collaboration session to get started!</p>
            </div>
        `
    return
  }

  sessionsList.innerHTML = data.sessions
    .map(
      (session) => `
        <div class="session-item" onclick="viewSessionDetails('${session.id}')">
            <div class="session-header">
                <div class="session-title">${session.title}</div>
                <div class="session-status ${session.status}">${session.status}</div>
            </div>
            <div class="session-meta">
                <span><i class='bx bx-user'></i> ${session.participants} participants</span>
                <span><i class='bx bx-code-alt'></i> ${session.language}</span>
                <span><i class='bx bx-time-five'></i> ${formatDate(session.createdAt)}</span>
            </div>
            <div class="session-description">${session.description}</div>
            <div class="session-actions">
                <button class="btn btn-sm btn-primary" onclick="joinSession('${session.id}')">Join</button>
                <button class="btn btn-sm btn-info" onclick="viewSessionDetails('${session.id}')">Details</button>
            </div>
        </div>
    `
    )
    .join('')
}

function loadApiDocsData() {
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
}

function updateApiDocs(data) {
  // Update stats
  document.getElementById('totalEndpoints').textContent = data.totalEndpoints || 0
  document.getElementById('totalCategories').textContent = data.categories?.length || 0

  // Update categories
  const categoriesList = document.getElementById('categoriesList')
  if (categoriesList && data.categories) {
    categoriesList.innerHTML = data.categories
      .map(
        (category) => `
            <div class="category-item" onclick="filterByCategory('${category.id}')">
                ${category.name} (${category.count})
            </div>
        `
      )
      .join('')
  }

  // Update endpoints
  const endpointsContainer = document.getElementById('endpointsContainer')
  if (endpointsContainer && data.endpoints) {
    endpointsContainer.innerHTML = data.endpoints
      .map(
        (endpoint) => `
            <div class="endpoint-item">
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
                            <div class="param-type">200 OK</div>
                            <div class="param-description">Returns ${endpoint.responseType || 'JSON data'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join('')
  }
}

// Utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
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

function viewSessionDetails(sessionId) {
  // Implement session details modal
  console.log('Viewing session details for:', sessionId)
}

function joinSession(sessionId) {
  // Implement join session functionality
  console.log('Joining session:', sessionId)
}

function filterByCategory(categoryId) {
  // Implement category filtering
  console.log('Filtering by category:', categoryId)
}

// Create Session Modal
const createSessionBtn = document.getElementById('createSessionBtn')
if (createSessionBtn) {
  createSessionBtn.addEventListener('click', function () {
    const modal = new bootstrap.Modal(document.getElementById('createSessionModal'))
    modal.show()
  })
}

// Submit Create Session Form
const submitSessionBtn = document.getElementById('submitSessionBtn')
if (submitSessionBtn) {
  submitSessionBtn.addEventListener('click', function () {
    const form = document.getElementById('createSessionForm')
    const formData = new FormData(form)

    const sessionData = {
      title: formData.get('sessionTitle'),
      description: formData.get('sessionDescription'),
      projectId: formData.get('projectId'),
      language: formData.get('language'),
      initialCode: formData.get('initialCode')
    }

    fetch('/api/collaboration/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + getCookie('token')
      },
      body: JSON.stringify(sessionData)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Close modal and refresh sessions
          bootstrap.Modal.getInstance(document.getElementById('createSessionModal')).hide()
          loadCollaborationData()
        } else {
          alert('Error creating session: ' + data.message)
        }
      })
      .catch((error) => console.error('Error creating session:', error))
  })
}
