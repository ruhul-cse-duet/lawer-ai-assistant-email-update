const Imap = require("imap");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ─────────────────────────────────────────────────────────────
//  SMTP transporter - send email from lawyer to client
// ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─────────────────────────────────────────────────────────────
//  Send email from lawyer to client and save to DB
// ─────────────────────────────────────────────────────────────
exports.sendEmail = async ({ to, subject, body, conversationId }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.LAWYER_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: body,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6">${body.replace(/\n/g, "<br>")}</div>`,
    });

    // Find an existing conversation or create a new one
    let conv = conversationId
      ? await Conversation.findById(conversationId)
      : await Conversation.findOne({ clientEmail: to });

    if (!conv) {
      conv = await Conversation.create({
        subject,
        clientEmail: to,
        clientName: to.split("@")[0],
        lawyerEmail: process.env.LAWYER_EMAIL,
        status: "active",
      });
    }

    // Save outgoing message to DB
    await Message.create({
      conversationId: conv._id,
      sender: "lawyer",
      senderEmail: process.env.LAWYER_EMAIL,
      body,
      subject,
      emailId: info.messageId,
      direction: "outgoing",
      isRead: true,
    });

    await Conversation.findByIdAndUpdate(conv._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 },
    });

    console.log(`✅ Email sent to client: ${to}`);
    return { success: true, messageId: info.messageId, conversationId: conv._id };
  } catch (err) {
    console.error("❌ Send email failed:", err.message);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
//  Fetch new client emails from Gmail IMAP and save to DB
//  Called automatically at the start of the 12-hour job
// ─────────────────────────────────────────────────────────────
exports.syncEmailsFromGmail = () => {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: process.env.GMAIL_USER,
      password: process.env.GMAIL_APP_PASSWORD,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    const syncedMessages = [];

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err) => {
        if (err) return reject(err);

        // Fetch only unread (UNSEEN) emails
        imap.search(["UNSEEN"], async (err, results) => {
          if (err) return reject(err);

          if (!results || results.length === 0) {
            console.log("📭 No new client emails found in Gmail.");
            imap.end();
            return resolve([]);
          }

          const fetch = imap.fetch(results, { bodies: "", markSeen: true });
          const parsePromises = [];

          fetch.on("message", (msg) => {
            const p = new Promise((res) => {
              msg.on("body", (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) return res(null);
                  try {
                    const emailId    = parsed.messageId;
                    const fromEmail  = parsed.from?.value?.[0]?.address || "";
                    const fromName   = parsed.from?.value?.[0]?.name || fromEmail;
                    const subject    = parsed.subject || "(No Subject)";
                    const body       = (parsed.text || "").substring(0, 5000);

                    // Skip lawyer's own email - only client emails
                    if (fromEmail === process.env.GMAIL_USER) return res(null);

                    // Duplicate check - prevent saving the same email twice
                    const exists = await Message.findOne({ emailId });
                    if (exists) return res(null);

                    // Find or create a client conversation
                    let conv = await Conversation.findOne({ clientEmail: fromEmail });
                    if (!conv) {
                      conv = await Conversation.create({
                        subject,
                        clientEmail: fromEmail,
                        clientName: fromName,
                        lawyerEmail: process.env.LAWYER_EMAIL,
                        status: "active",
                      });
                      console.log(`📁 New conversation created for: ${fromEmail}`);
                    }

                    // Save message
                    const saved = await Message.create({
                      conversationId: conv._id,
                      sender: "client",
                      senderEmail: fromEmail,
                      body,
                      subject,
                      emailId,
                      direction: "incoming",
                      isRead: false,
                    });

                    // Update conversation
                    await Conversation.findByIdAndUpdate(conv._id, {
                      lastMessageAt: new Date(),
                      clientName: fromName,
                      $inc: { messageCount: 1 },
                    });

                    console.log(`📨 Saved email from client: ${fromEmail}`);
                    syncedMessages.push(saved);
                    res(saved);
                  } catch (e) {
                    console.error("   Save error:", e.message);
                    res(null);
                  }
                });
              });
            });
            parsePromises.push(p);
          });

          fetch.once("end", async () => {
            await Promise.all(parsePromises);
            imap.end();
            resolve(syncedMessages.filter(Boolean));
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.error("❌ IMAP Error:", err.message);
      reject(err);
    });

    imap.once("end", () => {
      console.log(`✅ Gmail sync done. New emails saved: ${syncedMessages.length}`);
    });

    imap.connect();
  });
};
