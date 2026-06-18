// backend/controllers/reviewController.js
const Review = require('../models/Review');

// @desc    Submit code for AI review
// @route   POST /api/review
const createReview = async (req, res) => {
  try {
    const { code, language, sessionId } = req.body;

    // 1. MOCK AI RESPONSE
    const mockAIResponse = {
      score: 75,
      summary: "Good start, but there are some critical security practices missing.",
      issues: [
        {
          category: "security",
          severity: "high",
          title: "Hardcoded Credentials",
          explanation: "Never hardcode passwords or API keys directly in your code. Attackers can easily extract them. Use environment variables instead.",
          lineReference: "Line 12"
        },
        {
          category: "readability",
          severity: "low",
          title: "Inconsistent Indentation",
          explanation: "Mixing spaces and tabs makes the code harder to read for other developers. Stick to one standard.",
          lineReference: null
        }
      ]
    };

    // 2. DATABASE SAVE
    const newReview = new Review({
      sessionId: sessionId || 'anonymous-session',
      language: language,
      code: code,
      score: mockAIResponse.score,
      summary: mockAIResponse.summary,
      issues: mockAIResponse.issues
    });

    const savedReview = await newReview.save();

    // 3. RETURN
    res.status(201).json(savedReview);

  } catch (error) {
    console.error("❌ Error saving review:", error);
    res.status(500).json({ error: "Failed to process code review" });
  }
};

module.exports = {
  createReview
};