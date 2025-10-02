const express = require('express');
const router = express.Router();

// Import all necessary controller functions and middleware
const {
    createPost,
    getPostHistory,
    publishPost,
    updatePostStatus // This is the new function
} = require('../controllers/postController');
const { protect, moderator } = require('../middleware/authMiddleware');

// --- Existing Routes ---
// Create a new post (accessible to all authenticated users)
router.post('/', protect, createPost);

// Get all posts in history (accessible to all authenticated users)
router.get('/', protect, getPostHistory);

// Publish a post (accessible to moderators and admins)
router.put('/:id/publish', protect, moderator, publishPost);

// --- NEW ROUTE for Manual Moderation ---
// Manually update a post's status (e.g., to 'rejected' or 'approved')
router.put('/:id/status', protect, moderator, updatePostStatus);

module.exports = router;

