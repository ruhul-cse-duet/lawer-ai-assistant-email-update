const AISummary = require("../models/AISummary");
const { runUpdateJob } = require("../jobs/aiSummaryJob");

// List all AI summaries (newest first)
exports.getAllSummaries = async (req, res) => {
  try {
    const summaries = await AISummary.find().sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, count: summaries.length, summaries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get latest summary
exports.getLatestSummary = async (req, res) => {
  try {
    const summary = await AISummary.findOne().sort({ createdAt: -1 });
    if (!summary) return res.status(404).json({ error: "No AI update summary found yet." });
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manually trigger the 12-hour job
exports.triggerJobNow = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "AI update job triggered! Check server logs and your email inbox.",
    });
    runUpdateJob();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
