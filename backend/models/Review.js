// backend/models/Review.js
const mongoose = require('mongoose');

// Define the sub-schema for individual issues first
const issueSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['bug', 'security', 'readability', 'performance'] // Strict enforcement
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'] // Strict enforcement
  },
  title: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  lineReference: {
    type: String,
    required: false // Optional, as some issues are general
  }
});

// Define the main Review schema
const reviewSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false 
    },
    language: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    issues: {
        type: [issueSchema],
        default: []
    },
    isBookmarked: {
        type: Boolean,
        default: false
    },
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);