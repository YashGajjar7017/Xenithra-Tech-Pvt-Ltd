const express = require('express')
const memberController = require('../controller/member.controller')

const router = express.Router()

/**
 * Frontend Member Routes
 * Handles member pages and views
 */

// ============================================
// Members Directory & Listing
// ============================================

/**
 * GET /members
 * Display members directory page
 */
router.get('/members', memberController.getMembersPage)

/**
 * GET /members/search
 * Search members page
 */
router.get('/members/search', memberController.searchMembersPage)

/**
 * GET /members/:memberId
 * Display member profile page
 */
router.get('/members/:memberId', memberController.getMemberProfilePage)

/**
 * GET /members/:memberId/projects
 * Display member's projects page
 */
router.get('/members/:memberId/projects', memberController.getMemberProjectsPage)

/**
 * GET /members/:memberId/activity
 * Display member's activity page
 */
router.get('/members/:memberId/activity', memberController.getMemberActivityPage)

// ============================================
// Member Management (Admin)
// ============================================

/**
 * GET /members/admin/dashboard
 * Admin members management dashboard
 */
router.get('/admin/dashboard', memberController.getAdminDashboard)

/**
 * GET /members/admin/:memberId/edit
 * Edit member page (admin only)
 */
router.get('/admin/:memberId/edit', memberController.getEditMemberPage)

/**
 * POST /members/admin/:memberId/update
 * Update member from form (admin only)
 */
router.post('/admin/:memberId/update', memberController.updateMemberForm)

/**
 * POST /members/admin/:memberId/suspend
 * Suspend member from dashboard
 */
router.post('/admin/:memberId/suspend', memberController.suspendMemberForm)

/**
 * POST /members/admin/:memberId/activate
 * Activate member from dashboard
 */
router.post('/admin/:memberId/activate', memberController.activateMemberForm)

/**
 * POST /members/admin/:memberId/delete
 * Delete member from dashboard
 */
router.post('/admin/:memberId/delete', memberController.deleteMemberForm)

/**
 * POST /members/admin/:memberId/upgrade
 * Upgrade member plan from dashboard
 */
router.post('/admin/:memberId/upgrade', memberController.upgradePlanForm)

/**
 * POST /members/admin/:memberId/downgrade
 * Downgrade member plan from dashboard
 */
router.post('/admin/:memberId/downgrade', memberController.downgradePlanForm)

module.exports = router
