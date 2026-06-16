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
    required: true,
    index: true // Speeds up queries when we fetch a user's history later
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'cpp', 'csharp', 'dart']
  },
  code: {
    type: String,
    required: true,
    maxLength: 5000 // Protects against huge payloads eating up AI context limits
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  summary: {
    type: String,
    required: true
  },
  issues: [issueSchema], // Embedding our sub-schema here
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);