// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/stats
// @desc    Get live dashboard statistics
// @access  Private
router.get('/stats', protect, getDashboardStats);

module.exports = router;
