const express = require('express');
const router = express.Router();

// Correctly import the controller and middleware
const { getModerationLogs } = require('../controllers/moderationLogController');
const { protect, moderator } = require('../middleware/authMiddleware');

/**
 * @desc    Get all moderation log entries
 * @route   GET /api/moderation-logs
 * @access  Private/Moderator
 */
router.get('/', protect, moderator, getModerationLogs);

module.exports = router;

