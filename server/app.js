const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const emailRoutes = require("./routes/emailRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "AI Lawyer Assistant Running" });
});

app.use("/api/chat", chatRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/summaries", summaryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;