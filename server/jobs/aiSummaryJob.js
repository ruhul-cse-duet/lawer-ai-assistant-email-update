const cron = require("node-cron");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const AISummary = require("../models/AISummary");
const { generateConversationUpdate } = require("../services/openaiService");
const { sendUpdateToLawyer } = require("../services/notificationService");
const { syncEmailsFromGmail } = require("../services/emailService");

// ─────────────────────────────────────────────────────────────
//  12-Hour Job - main steps:
//
//  Step 1 -> Fetch new client emails from Gmail IMAP
//  Step 2 -> Read last 12 hours of conversations from DB
//  Step 3 -> Generate summary/update with AI
//  Step 4 -> Save summary to DB
//  Step 5 -> Send update to lawyer email
// ─────────────────────────────────────────────────────────────
const runUpdateJob = async () => {
  console.log("\n⏰ ========== 12-Hour AI Update Job Started ==========");
  const jobStart = new Date();

  try {
    // ── Step 1: Sync new emails from Gmail ──────────────
    console.log("\n📧 Step 1: Syncing new emails from Gmail INBOX...");
    try {
      const newEmails = await syncEmailsFromGmail();
      console.log(`   ✅ Synced ${newEmails.length} new client email(s) into DB`);
    } catch (syncErr) {
      console.error(`   ⚠️  Gmail sync failed (continuing anyway): ${syncErr.message}`);
      // If sync fails, continue with existing DB data
    }

    // ── Step 2: Read last 12 hours of messages from DB ──────────
    console.log("\n📂 Step 2: Reading last 12 hours of conversations from DB...");
    const fromDate = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const toDate   = new Date();

    const recentMessages = await Message.find({
      direction: "incoming",           // only client emails
      createdAt: { $gte: fromDate },
    }).populate("conversationId");

    if (recentMessages.length === 0) {
      console.log("   📭 No client messages in last 12 hours. Skipping update.");
      console.log("======================================================\n");
      return;
    }

    console.log(`   ✅ Found ${recentMessages.length} client message(s) to summarize`);

    // ── Step 3: Group conversations by client ──
    console.log("\n🗂️  Step 3: Grouping messages by client...");
    const clientMap = {};

    for (const msg of recentMessages) {
      const email    = msg.senderEmail || "unknown";
      const convData = msg.conversationId;

      if (!clientMap[email]) {
        clientMap[email] = {
          clientName:  convData?.clientName || email.split("@")[0],
          clientEmail: email,
          messages:    [],
        };
      }

      const time = msg.createdAt.toLocaleTimeString("en-BD", { timeZone: "Asia/Dhaka" });
      clientMap[email].messages.push(`  [${time}] ${msg.body.trim()}`);
    }

    // Build formatted text for the AI
    let conversationsText = "";
    for (const [email, data] of Object.entries(clientMap)) {
      conversationsText += `\nClient: ${data.clientName} (${data.clientEmail})\n`;
      conversationsText += `Messages:\n${data.messages.join("\n")}\n`;
      conversationsText += `${"─".repeat(50)}\n`;
    }

    // ── Step 4: Generate update/summary with AI ───────────────
    console.log("\n🤖 Step 4: Generating AI update report...");
    const summary = await generateConversationUpdate(conversationsText, 12);
    console.log("   ✅ AI update report generated");

    // ── Step 5: Save summary to DB ────────────────────────
    const savedSummary = await AISummary.create({
      summary,
      conversationCount: Object.keys(clientMap).length,
      messageCount:      recentMessages.length,
      fromDate,
      toDate,
      sentToLawyer: false,
    });

    // ── Step 6: Send update to lawyer email ─────────────────
    console.log("\n📬 Step 5: Sending update email to lawyer...");
    await sendUpdateToLawyer({
      summary,
      messageCount:      recentMessages.length,
      conversationCount: Object.keys(clientMap).length,
      fromDate,
      toDate,
    });

    // Update sent status
    await AISummary.findByIdAndUpdate(savedSummary._id, {
      sentToLawyer: true,
      sentAt: new Date(),
    });

    console.log(`\n✅ Job complete!`);
    console.log(`   → Client messages processed: ${recentMessages.length}`);
    console.log(`   → Clients covered: ${Object.keys(clientMap).length}`);
    console.log(`   → Update sent to: ${process.env.LAWYER_EMAIL}`);
    console.log(`   → Duration: ${((new Date() - jobStart) / 1000).toFixed(1)}s`);
    console.log("======================================================\n");

  } catch (err) {
    console.error("❌ Update job failed:", err.message);
    console.error(err.stack);
  }
};

// ─────────────────────────────────────────────────────────────
//  Cron job schedule - every day at 8:00 AM and 8:00 PM (Dhaka time)
//  Or every 12 hours: "0 */12 * * *"
// ─────────────────────────────────────────────────────────────
const startSummaryJob = () => {
  // Every day at 8 AM and 8 PM Dhaka time
  cron.schedule("0 8,20 * * *", runUpdateJob, {
    scheduled: true,
    timezone: "Asia/Dhaka",
  });

  console.log("✅ AI Update Job scheduled — runs at 8:00 AM & 8:00 PM (Dhaka time)");
};

module.exports = { startSummaryJob, runUpdateJob }; // manual trigger support
