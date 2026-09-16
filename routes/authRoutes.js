const express = require('express');
const router = express.Router();
const { handleGoogleAuth, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/google
// @desc    Authenticate user via Google OAuth or Demo mode
router.post('/google', handleGoogleAuth);

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
router.get('/me', protect, getMe);

module.exports = router;
