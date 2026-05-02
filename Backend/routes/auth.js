const express = require('express');
const router = express.Router();
const { register, login, logout, rotateRefreshToken } = require('../controllers/authController'); // ✅ added logout and rotateRefreshToken
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');  

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, register);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', authLimiter, login);

// @route   POST /api/auth/logout
// @desc    Revoke refresh token
// @access  Public
router.post('/logout', apiLimiter, logout);

// @route   POST /api/auth/refresh-token
// @desc    Rotate refresh token and issue new access token
// @access  Public
router.post('/refresh-token', apiLimiter, rotateRefreshToken);

module.exports = router;