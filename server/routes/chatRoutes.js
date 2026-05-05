const router = require("express").Router();
const { askLaw } = require("../controllers/chatController");

// POST /api/chat/ask
router.post("/ask", askLaw);

module.exports = router;