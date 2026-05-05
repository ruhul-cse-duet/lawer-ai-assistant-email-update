const router = require("express").Router();
const { sendClientEmail, syncEmails, getMessages } = require("../controllers/emailController");

// POST /api/emails/send - send email to a client
router.post("/send", sendClientEmail);

// POST /api/emails/sync - manual Gmail sync
router.post("/sync", syncEmails);

// GET /api/emails/messages/:conversationId - get conversation messages
router.get("/messages/:conversationId", getMessages);

module.exports = router;