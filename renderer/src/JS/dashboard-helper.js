/**
 * Common Dashboard Helper
 * Handles role-based dashboard logic for both admin and user dashboards
 */

// ============================================
// Utility Functions
// ============================================

/**
 * Get cookie by name
 */
function getCookie(name) {
  let cookies = document.cookie.split('; ')
  for (let cookie of cookies) {
    let [key, value] = cookie.split('=')
    if (key === name) return decodeURIComponent(value)
  }
  return null
}

/**
 * Get user role from cookie or localStorage
 */
function getUserRole() {
  return getCookie('role') || localStorage.getItem('role') || 'user'
}

/**
 * Get user data from localStorage
 */
function getUserData() {
  try {
    const userDataStr = localStorage.getItem('user')
    return userDataStr ? JSON.parse(userDataStr) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

/**
 * Get username from cookie or localStorage
 */
function getUsername() {
  return getCookie('username') || getUserData()?.username || 'Guest'
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return getCookie('username') !== null || localStorage.getItem('token') !== null
}

/**
 * Check if user is admin
 */
function isAdmin() {
  return getUserRole() === 'admin'
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    console.warn('User not authenticated, redirecting to login')
    window.location.href = '/Account/login'
    return false
  }
  return true
}

/**
 * Initialize dashboard with user info
 */
function initializeDashboardCommon() {
  console.log('=== DASHBOARD INITIALIZATION ===')

  // Check authentication
  if (!requireAuth()) {
    return false
  }

  const username = getUsername()
  const userRole = getUserRole()

  console.log('User:', username)
  console.log('Role:', userRole)
  console.log('Is Admin:', isAdmin())

  // Update username display
  const usernameElements = document.querySelectorAll(
    '[data-username], .username-display, #username'
  )
  usernameElements.forEach((el) => {
    if (el.textContent !== undefined) {
      el.textContent = username
    }
  })

  // Show role badge
  showRoleBadge(userRole)

  return true
}

/**
 * Display role badge
 */
function showRoleBadge(role) {
  // Create or update role badge
  let roleBadge = document.getElementById('role-badge')

  if (!roleBadge) {
    roleBadge = document.createElement('span')
    roleBadge.id = 'role-badge'
    roleBadge.className = 'role-badge'

    // Try to insert it in header
    const header =
      document.querySelector('header') || document.querySelector('.header') || document.body
    if (header) {
      header.appendChild(roleBadge)
    }
  }

  const roleText = role.charAt(0).toUpperCase() + role.slice(1)
  const roleClass = role === 'admin' ? 'badge-danger' : 'badge-primary'

  roleBadge.textContent = roleText
  roleBadge.className = `role-badge badge ${roleClass}`

  console.log(`Role badge updated: ${roleText}`)
}

/**
 * Hide elements that are not for this role
 */
function hideNonRoleElements() {
  const userRole = getUserRole()

  // Hide admin-only elements for non-admins
  if (userRole !== 'admin') {
    document.querySelectorAll('[data-admin-only], .admin-only, [role="admin"]').forEach((el) => {
      el.style.display = 'none'
      console.log('Hiding admin-only element:', el)
    })
  }

  // Hide user-only elements for admins
  if (userRole === 'admin') {
    document.querySelectorAll('[data-user-only], .user-only, [role="user"]').forEach((el) => {
      el.style.display = 'none'
      console.log('Hiding user-only element:', el)
    })
  }
}

/**
 * Logout function
 */
function logoutDashboard() {
  console.log('Logging out user...')

  // Clear cookies
  document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/'
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/'
  document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/'
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/'

  // Clear localStorage
  localStorage.clear()
  sessionStorage.clear()

  // Send logout request to backend
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then(() => {
      console.log('Logout successful')
      window.location.href = '/Account/login'
    })
    .catch((error) => {
      console.error('Logout error:', error)
      // Redirect anyway
      window.location.href = '/Account/login'
    })
}

/**
 * Setup logout button
 */
function setupLogoutButton() {
  const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn, #logout')

  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault()
      if (confirm('Are you sure you want to logout?')) {
        logoutDashboard()
      }
    })
  })
}

/**
 * Setup dashboard navigation for role
 */
function setupDashboardNavigation() {
  const userRole = getUserRole()
  const adminLinks = document.querySelectorAll('[data-admin-link]')
  const userLinks = document.querySelectorAll('[data-user-link]')

  if (userRole === 'admin') {
    adminLinks.forEach((link) => (link.style.display = 'block'))
    userLinks.forEach((link) => (link.style.display = 'none'))
  } else {
    adminLinks.forEach((link) => (link.style.display = 'none'))
    userLinks.forEach((link) => (link.style.display = 'block'))
  }
}

/**
 * Load dashboard data based on role
 */
function loadDashboardDataByRole() {
  const userRole = getUserRole()

  if (userRole === 'admin') {
    loadAdminDashboardData()
  } else {
    loadUserDashboardData()
  }
}

/**
 * Load admin dashboard data
 */
function loadAdminDashboardData() {
  console.log('Loading admin dashboard data...')

  // Fetch admin statistics
  fetch('/api/admin/stats', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Admin stats:', data)
      // Update admin dashboard with data
      updateAdminDashboard(data)
    })
    .catch((error) => console.error('Error loading admin stats:', error))
}

/**
 * Load user dashboard data
 */
function loadUserDashboardData() {
  console.log('Loading user dashboard data...')

  // Fetch user statistics
  fetch('/api/user/stats', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('User stats:', data)
      // Update user dashboard with data
      updateUserDashboard(data)
    })
    .catch((error) => console.error('Error loading user stats:', error))
}

/**
 * Update admin dashboard with data
 */
function updateAdminDashboard(data) {
  // Update admin-specific dashboard elements
  if (data.totalUsers) {
    const element = document.getElementById('total-users')
    if (element) element.textContent = data.totalUsers
  }
  if (data.activeUsers) {
    const element = document.getElementById('active-users')
    if (element) element.textContent = data.activeUsers
  }
  // Add more admin-specific updates as needed
}

/**
 * Update user dashboard with data
 */
function updateUserDashboard(data) {
  // Update user-specific dashboard elements
  if (data.totalProjects) {
    const element = document.getElementById('total-projects')
    if (element) element.textContent = data.totalProjects
  }
  if (data.completedProjects) {
    const element = document.getElementById('completed-projects')
    if (element) element.textContent = data.completedProjects
  }
  // Add more user-specific updates as needed
}

/**
 * Main dashboard initialization
 * Call this in the DOMContentLoaded event
 */
function initializeDashboard() {
  console.log('=== INITIALIZING DASHBOARD ===')

  // Initialize common dashboard features
  if (!initializeDashboardCommon()) {
    return
  }

  // Hide non-role elements
  hideNonRoleElements()

  // Setup navigation
  setupDashboardNavigation()

  // Setup logout button
  setupLogoutButton()

  // Load role-specific data
  loadDashboardDataByRole()

  console.log('=== DASHBOARD INITIALIZATION COMPLETE ===')
}

// Export for use in both dashboards
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeDashboard,
    initializeDashboardCommon,
    getUserRole,
    getUserData,
    getUsername,
    isAuthenticated,
    isAdmin,
    logoutDashboard,
    hideNonRoleElements,
    setupDashboardNavigation,
    loadDashboardDataByRole,
    requireAuth
  }
}
