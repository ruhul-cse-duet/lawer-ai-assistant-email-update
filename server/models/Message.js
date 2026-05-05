const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Parent conversation
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // Sender: "lawyer" or "client"
    sender: {
      type: String,
      enum: ["lawyer", "client"],
      required: true,
    },

    // Sender email address
    senderEmail: { type: String, required: true },

    // Email subject
    subject: { type: String },

    // Email body content
    body: { type: String, required: true },

    // Gmail unique message ID (prevent duplicates)
    emailId: { type: String, unique: true, sparse: true },

    // "incoming" = client to lawyer, "outgoing" = lawyer to client
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },

    // Whether the lawyer has read it
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
