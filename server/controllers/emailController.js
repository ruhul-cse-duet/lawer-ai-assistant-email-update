const { sendEmail, syncEmailsFromGmail } = require("../services/emailService");
const Message = require("../models/Message");

// ─────────────────────────────────────────────────────────────
//  Send email from lawyer to client
//  Store the email in the DB
// ─────────────────────────────────────────────────────────────
exports.sendClientEmail = async (req, res) => {
  try {
    const { to, subject, body, conversationId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "to, subject, and body are required." });
    }

    const result = await sendEmail({ to, subject, body, conversationId });

    res.json({
      success: true,
      message: `Email sent to ${to} and saved to DB.`,
      ...result,
    });
  } catch (err) {
    console.error("❌ Send email error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Manually sync new emails from Gmail
// (12-hour job runs automatically; this is a manual trigger)
// ─────────────────────────────────────────────────────────────
exports.syncEmails = async (req, res) => {
  try {
    const synced = await syncEmailsFromGmail();
    res.json({
      success: true,
      synced: synced.length,
      message: `${synced.length} new client email(s) synced from Gmail and saved to DB.`,
    });
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Get all conversation messages (timeline)
// ─────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
