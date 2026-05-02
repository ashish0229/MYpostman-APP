const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,              // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests. Please try again after 15 minutes.'
  }
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,               // 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

// Strict limiter for AI content generation
const contentGenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,               // 20 generation requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Content generation limit reached. Try again in 1 hour.'
  }
});

module.exports = { apiLimiter, authLimiter, contentGenLimiter };