const express = require('express');
const router = express.Router();
// Make sure to import the new publishPost function
const { createPost, getPostHistory, publishPost } = require('../controllers/postController');

// Route to create a new post
router.post('/', createPost);

// Route to get all posts
router.get('/', getPostHistory);

// Add this new route to handle publishing a post
router.put('/:id/publish', publishPost);

module.exports = router;
