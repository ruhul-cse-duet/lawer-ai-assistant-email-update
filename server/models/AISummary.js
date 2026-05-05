const mongoose = require("mongoose");

const aiSummarySchema = new mongoose.Schema(
  {
    // AI-generated conversation update/summary text
    summary: { type: String, required: true },

    // Number of client conversations covered
    conversationCount: { type: Number, default: 0 },

    // Total number of messages processed
    messageCount: { type: Number, default: 0 },

    // Time range covered (from -> to)
    fromDate: { type: Date },
    toDate:   { type: Date },

    // Whether it was sent to the lawyer
    sentToLawyer: { type: Boolean, default: false },
    sentAt:       { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AISummary", aiSummarySchema);
