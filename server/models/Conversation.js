const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Email subject line
    subject: { type: String, required: true },

    // Client information
    clientEmail: { type: String, required: true },
    clientName:  { type: String, default: "Unknown Client" },

    // Lawyer email (usually process.env.LAWYER_EMAIL)
    lawyerEmail: { type: String, required: true },

    // Conversation status
    status: {
      type: String,
      enum: ["active", "closed", "pending"],
      default: "active",
    },

    // When the last message arrived
    lastMessageAt: { type: Date, default: Date.now },

    // Total messages in this conversation
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
