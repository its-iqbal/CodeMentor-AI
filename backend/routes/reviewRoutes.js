const express = require('express');
const router = express.Router();
const { createReview, getReviewHistory } = require('../controllers/reviewController');

// POST request to submit a new review
router.post('/', createReview);

// GET request to fetch history based on sessionId
router.get('/:sessionId', getReviewHistory);

module.exports = router;