const express = require('express');
const router = express.Router();
const { createReview, getReviewHistory, updateReview } = require('../controllers/reviewController');

// POST request to submit a new review
router.post('/', createReview);

// GET request to fetch history based on sessionId
router.get('/:sessionId', getReviewHistory);

// Route: PUT /api/review/:id
router.put('/:id', updateReview);

module.exports = router;