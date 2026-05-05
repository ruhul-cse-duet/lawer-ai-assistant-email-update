const nodemailer = require("nodemailer");

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
//  Send 12-hour email update to the lawyer
//  Send the AI summary in a professional email format
// ─────────────────────────────────────────────────────────────
exports.sendUpdateToLawyer = async ({
  summary,
  messageCount,
  conversationCount,
  fromDate,
  toDate,
}) => {
  const formattedFrom = fromDate.toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });
  const formattedTo   = toDate.toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });

  const subject = `⚖️ Email Update: ${messageCount} client message(s) in last 12 hours — ${new Date().toLocaleDateString("en-BD")}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:680px;margin:30px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:#1a3c5e;padding:25px 30px;">
      <h2 style="margin:0;color:#ffffff;font-size:20px;">⚖️ AI Lawyer Assistant</h2>
      <p style="margin:6px 0 0 0;color:#a8c4e0;font-size:14px;">Your 12-Hour Email Conversation Update</p>
    </div>

    <!-- Stats Bar -->
    <div style="background:#eaf0f6;padding:16px 30px;display:flex;gap:30px;border-bottom:1px solid #d0dce8;">
      <div>
        <span style="font-size:22px;font-weight:bold;color:#1a3c5e;">${messageCount}</span>
        <span style="font-size:13px;color:#666;margin-left:6px;">New Client Messages</span>
      </div>
      <div>
        <span style="font-size:22px;font-weight:bold;color:#1a3c5e;">${conversationCount}</span>
        <span style="font-size:13px;color:#666;margin-left:6px;">Active Conversations</span>
      </div>
    </div>

    <!-- Period -->
    <div style="padding:12px 30px;background:#f9f9f9;border-bottom:1px solid #eee;font-size:13px;color:#888;">
      📅 Period: <strong>${formattedFrom}</strong> → <strong>${formattedTo}</strong>
    </div>

    <!-- AI Summary -->
    <div style="padding:25px 30px;">
      <h3 style="margin:0 0 15px 0;color:#1a3c5e;font-size:16px;">📝 AI Summary of Client Conversations:</h3>
      <div style="background:#f8f9fa;border-left:4px solid #1a3c5e;padding:18px 20px;border-radius:4px;font-size:14px;line-height:1.8;color:#333;white-space:pre-line;">${summary}</div>
    </div>

    <!-- Footer -->
    <div style="background:#f4f4f4;padding:18px 30px;border-top:1px solid #e0e0e0;font-size:12px;color:#999;text-align:center;">
      <p style="margin:0;">This is an automated update from your AI Lawyer Assistant.</p>
      <p style="margin:5px 0 0 0;">Next update will be sent in 12 hours.</p>
    </div>

  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"AI Lawyer Assistant" <${process.env.SMTP_USER}>`,
    to: process.env.LAWYER_EMAIL,
    subject,
    html: htmlBody,
    text: `AI 12-Hour Update\nMessages: ${messageCount} | Conversations: ${conversationCount}\nPeriod: ${formattedFrom} → ${formattedTo}\n\n${summary}`,
  });

  console.log(`✅ 12-hour update email sent to lawyer: ${process.env.LAWYER_EMAIL}`);
};
