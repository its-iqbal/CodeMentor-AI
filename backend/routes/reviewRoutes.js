// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');

// Because this route will be mounted at '/api/review' in server.js, 
// the '/' here actually represents '/api/review'
router.post('/', createReview);

module.exports = router;