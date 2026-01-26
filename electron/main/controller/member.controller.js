/**
 * Frontend Member Controller
 * Handles member page rendering and form submissions
 */

const path = require('path')
const axios = require('axios')

const backendAPI = 'http://localhost:8000/api'

// ============================================
// Helper Functions
// ============================================

/**
 * Get auth headers with token from session
 */
const getAuthHeaders = (req) => {
  const token = req.session?.user?.token || req.cookies?.auth_token || ''
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

/**
 * Fetch data from backend API
 */
const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const response = await axios.get(`${backendAPI}${endpoint}`, options)
    return response.data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message)
    throw error
  }
}

// ============================================
// Members Directory Pages
// ============================================

/**
 * GET /members - Members directory page
 */
exports.getMembersPage = async (req, res) => {
  try {
    const { page = 1, role, search } = req.query

    // Build query parameters
    let queryParams = `?page=${page}&limit=12`
    if (role) queryParams += `&role=${role}`
    if (search) queryParams += `&search=${search}`

    // Fetch members from backend API
    const membersData = await fetchFromAPI(`/members${queryParams}`, getAuthHeaders(req))

    res.json({
      success: true,
      title: 'Members Directory',
      members: membersData.data,
      pagination: membersData.pagination
    })
  } catch (error) {
    console.error('Error loading members page:', error)
    res.status(500).json({
      success: false,
      message: 'Error loading members',
      error: error.message
    })
  }
}

/**
 * GET /members/search - Search members
 */
exports.searchMembersPage = async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      })
    }

    const results = await fetchFromAPI(`/members/search/${q}?limit=20`, getAuthHeaders(req))

    res.json({
      success: true,
      query: q,
      results: results.data,
      count: results.count
    })
  } catch (error) {
    console.error('Error searching members:', error)
    res.status(500).json({
      success: false,
      message: 'Error searching members',
      error: error.message
    })
  }
}

/**
 * GET /members/:memberId - Member profile page
 */
exports.getMemberProfilePage = async (req, res) => {
  try {
    const { memberId } = req.params

    // Fetch member profile from API
    const profileData = await fetchFromAPI(`/members/${memberId}/profile`, getAuthHeaders(req))

    res.json({
      success: true,
      profile: profileData.data
    })
  } catch (error) {
    console.error('Error loading member profile:', error)
    res.status(404).json({
      success: false,
      message: 'Member not found'
    })
  }
}

/**
 * GET /members/:memberId/projects - Member projects page
 */
exports.getMemberProjectsPage = async (req, res) => {
  try {
    const { memberId } = req.params
    const { page = 1 } = req.query

    const projectsData = await fetchFromAPI(
      `/members/${memberId}/projects?page=${page}&limit=10`,
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      memberId,
      projects: projectsData.data,
      pagination: projectsData.pagination
    })
  } catch (error) {
    console.error('Error loading member projects:', error)
    res.status(500).json({
      success: false,
      message: 'Error loading projects',
      error: error.message
    })
  }
}

/**
 * GET /members/:memberId/activity - Member activity page
 */
exports.getMemberActivityPage = async (req, res) => {
  try {
    const { memberId } = req.params
    const { page = 1 } = req.query

    const activityData = await fetchFromAPI(
      `/members/${memberId}/activity?page=${page}&limit=20`,
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      memberId,
      activities: activityData.data,
      pagination: activityData.pagination
    })
  } catch (error) {
    console.error('Error loading member activity:', error)
    res.status(500).json({
      success: false,
      message: 'Error loading activity',
      error: error.message
    })
  }
}

// ============================================
// Admin Member Management
// ============================================

/**
 * GET /members/admin/dashboard - Admin dashboard
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Check if user is admin
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    // Fetch members stats and list
    const statsData = await fetchFromAPI('/members/stats', getAuthHeaders(req))
    const membersData = await fetchFromAPI('/members?limit=20&page=1', getAuthHeaders(req))

    res.json({
      success: true,
      stats: statsData.data,
      members: membersData.data,
      pagination: membersData.pagination
    })
  } catch (error) {
    console.error('Error loading admin dashboard:', error)
    res.status(500).json({
      success: false,
      message: 'Error loading admin dashboard',
      error: error.message
    })
  }
}

/**
 * GET /members/admin/:memberId/edit - Edit member page
 */
exports.getEditMemberPage = async (req, res) => {
  try {
    // Check if user is admin
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params

    const memberData = await fetchFromAPI(`/members/${memberId}`, getAuthHeaders(req))

    res.json({
      success: true,
      member: memberData.data
    })
  } catch (error) {
    console.error('Error loading edit member page:', error)
    res.status(500).json({
      success: false,
      message: 'Error loading member data',
      error: error.message
    })
  }
}

/**
 * POST /members/admin/:memberId/update - Update member
 */
exports.updateMemberForm = async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params
    const updateData = req.body

    const response = await axios.patch(
      `${backendAPI}/members/${memberId}`,
      updateData,
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      message: 'Member updated successfully',
      member: response.data.data
    })
  } catch (error) {
    console.error('Error updating member:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating member',
      error: error.message
    })
  }
}

/**
 * POST /members/admin/:memberId/suspend - Suspend member
 */
exports.suspendMemberForm = async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params
    const { reason } = req.body

    const response = await axios.post(
      `${backendAPI}/members/${memberId}/suspend`,
      { reason },
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      message: 'Member suspended successfully',
      member: response.data.data
    })
  } catch (error) {
    console.error('Error suspending member:', error)
    res.status(500).json({
      success: false,
      message: 'Error suspending member',
      error: error.message
    })
  }
}

/**
 * POST /members/admin/:memberId/activate - Activate member
 */
exports.activateMemberForm = async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params

    const response = await axios.post(
      `${backendAPI}/members/${memberId}/activate`,
      {},
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      message: 'Member activated successfully',
      member: response.data.data
    })
  } catch (error) {
    console.error('Error activating member:', error)
    res.status(500).json({
      success: false,
      message: 'Error activating member',
      error: error.message
    })
  }
}

/**
 * POST /members/admin/:memberId/delete - Delete member
 */
exports.deleteMemberForm = async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params

    await axios.delete(`${backendAPI}/members/${memberId}`, getAuthHeaders(req))

    res.json({
      success: true,
      message: 'Member deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting member:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting member',
      error: error.message
    })
  }
}

/**
 * POST /members/admin/:memberId/upgrade - Upgrade plan
 */
exports.upgradePlanForm = async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params
    const { plan } = req.body

    const response = await axios.post(
      `${backendAPI}/members/${memberId}/upgrade`,
      { plan },
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      message: `Member plan upgraded to ${plan}`,
      subscription: response.data.data
    })
  } catch (error) {
    console.error('Error upgrading plan:', error)
    res.status(500).json({
      success: false,
      message: 'Error upgrading plan',
      error: error.message
    })
  }
}

/**
 * POST /members/admin/:memberId/downgrade - Downgrade plan
 */
exports.downgradePlanForm = async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Admin only'
      })
    }

    const { memberId } = req.params
    const { plan = 'free' } = req.body

    const response = await axios.post(
      `${backendAPI}/members/${memberId}/downgrade`,
      { plan },
      getAuthHeaders(req)
    )

    res.json({
      success: true,
      message: `Member plan downgraded to ${plan}`,
      subscription: response.data.data
    })
  } catch (error) {
    console.error('Error downgrading plan:', error)
    res.status(500).json({
      success: false,
      message: 'Error downgrading plan',
      error: error.message
    })
  }
}
