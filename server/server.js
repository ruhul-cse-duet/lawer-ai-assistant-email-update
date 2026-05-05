require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { startSummaryJob } = require("./jobs/aiSummaryJob");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startSummaryJob();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📧 Lawyer: ${process.env.LAWYER_EMAIL}`);
      console.log(`⏰ AI Summary Job: every 12 hours`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();