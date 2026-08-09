// backend/controllers/reviewController.js
const Review = require('../models/Review');
const Groq = require('groq-sdk');

// Initialize Groq client conditionally if the key exists
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Base prompt definition used by both engines
const getSystemInstructions = (isRetry) => {
  const instruction = isRetry 
    ? "Your previous response was not valid JSON. Return ONLY the JSON object, with no other text."
    : "You are CodeMentor AI, an expert code reviewer. Analyze the code and explain WHY issues matter in plain language.";

  return `
    ${instruction}
    
    Respond with ONLY valid JSON matching this exact shape, with no markdown formatting and no code fences:
    {
      "score": <integer 0-100>,
      "summary": "<1-2 sentence overall summary>",
      "issues": [
        {
          "category": "bug" | "security" | "readability" | "performance",
          "severity": "low" | "medium" | "high",
          "title": "<short issue title>",
          "explanation": "<why this matters, in plain language>",
          "lineReference": "<optional line number or snippet>"
        }
      ]
    }
  `;
};

// 1. OLLAMA ENGINE FLOW
// UPDATED: Now accepts a requestedModel parameter
const fetchOllamaResponse = async (prompt, isRetry = false, requestedModel) => {
  const fullPrompt = `${getSystemInstructions(isRetry)}\n\nUSER PROMPT:\n${prompt}`;
  const modelToUse = requestedModel || 'llama3:8b'; // Fallback to your local 8b
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelToUse, // Injecting the dynamic model here
      prompt: fullPrompt,
      format: 'json',
      stream: false
    })
  });

  if (!response.ok) throw new Error(`Ollama API error! status: ${response.status}`);
  const data = await response.json();
  return data.response;
};

// 2. GROQ ENGINE FLOW
// UPDATED: Now accepts a requestedModel parameter
const fetchGroqResponse = async (prompt, isRetry = false, requestedModel) => {
  if (!groq) throw new Error("Groq API key missing in environment variables.");
  
  const modelToUse = requestedModel || 'llama-3.1-8b-instant'; // Fallback

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: getSystemInstructions(isRetry) },
      { role: "user", content: prompt }
    ],
    model: modelToUse, // Injecting the dynamic model here
    response_format: { type: "json_object" } 
  });

  return chatCompletion.choices[0].message.content;
};

// Main controller orchestration entrypoint
const createReview = async (req, res) => {
  try {
    // UPDATED: Extract the model string sent from the React dropdown
    const { code, language, sessionId, model } = req.body;
    const provider = process.env.AI_PROVIDER || 'ollama';

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const aiPrompt = `Review the following ${language} code:\n\n${code}`;
    let aiRawResponse;
    let parsedData;

    const fetchAIResponse = provider === 'groq' ? fetchGroqResponse : fetchOllamaResponse;

    try {
      console.log(`Route hitting active AI provider: [${provider.toUpperCase()}] with model: [${model || 'default'}]`);
      // UPDATED: Pass the requested model to the fetch function
      aiRawResponse = await fetchAIResponse(aiPrompt, false, model);
      parsedData = JSON.parse(aiRawResponse);
    } catch (firstError) {
      console.warn(`First parsing attempt failed via ${provider}, running fallback retry...`);
      // UPDATED: Pass the requested model to the retry fetch function too
      aiRawResponse = await fetchAIResponse(aiPrompt, true, model);
      parsedData = JSON.parse(aiRawResponse);
    }

    if (!parsedData.issues || !Array.isArray(parsedData.issues)) {
      parsedData.issues = [];
    }

    const newReview = new Review({
      sessionId: sessionId || 'anonymous-session',
      language,
      code,
      score: parsedData.score || 0,
      summary: parsedData.summary || "Review completed.",
      issues: parsedData.issues
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);

  } catch (error) {
    console.error("Error processing AI review:", error);
    res.status(500).json({ error: "Failed to process code review. Ensure selected engine is active." });
  }
};

const getReviewHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await Review.find({ sessionId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch review history" });
  }
};

// NEW: Update an existing review (Bookmark / Add Tags)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBookmarked, tags } = req.body;

    // Find the review by ID and update the provided fields
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { 
        // Only update fields that were actually sent in the request
        ...(isBookmarked !== undefined && { isBookmarked }),
        ...(tags !== undefined && { tags })
      },
      { new: true } // Return the updated document, not the old one
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
};

module.exports = { createReview, getReviewHistory, updateReview };