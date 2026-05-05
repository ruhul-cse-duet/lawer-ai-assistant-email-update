const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// List all conversations (latest first)
exports.getAllConversations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(filter);

    res.json({ success: true, total, page: parseInt(page), conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Conversation details and messages
exports.getConversationDetails = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: "Conversation not found." });

    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });

    res.json({ success: true, conversation, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update conversation status (active / closed / pending)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "closed", "pending"].includes(status)) {
      return res.status(400).json({ error: "Status must be: active, closed, or pending" });
    }

    const conv = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, conversation: conv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
