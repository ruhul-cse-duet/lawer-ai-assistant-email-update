const router = require("express").Router();
const {
  getAllConversations,
  getConversationDetails,
  updateStatus
} = require("../controllers/conversationController");

// GET /api/conversations - all conversations
router.get("/", getAllConversations);

// GET /api/conversations/:id - details + messages
router.get("/:id", getConversationDetails);

// PATCH /api/conversations/:id/status - status update
router.patch("/:id/status", updateStatus);

module.exports = router;