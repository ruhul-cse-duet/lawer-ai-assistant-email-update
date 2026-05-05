const { legalChat } = require("../services/openaiService");

// ─────────────────────────────────────────────────────────────
//  Legal Chatbot Controller

//  chatHistory sent conversation context remeber
// ─────────────────────────────────────────────────────────────
exports.askLaw = async (req, res) => {
  try {
    const { question, chatHistory = [] } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question cannot be empty." });
    }

    const answer = await legalChat(question.trim(), chatHistory);

    res.json({
      success: true,
      question,
      answer,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("❌ Chatbot error:", err.message);
    res.status(500).json({ error: "AI service error. Please try again." });
  }
};
