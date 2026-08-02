const express = require('express');
const router = express.Router();
const { githubLogin, githubCallback } = require('../controllers/authController');

// Route: GET /api/auth/github
router.get('/github', githubLogin);

// Route: GET /api/auth/github/callback
router.get('/github/callback', githubCallback);

module.exports = router;