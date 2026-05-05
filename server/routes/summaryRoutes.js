const router = require("express").Router();
const {
  getAllSummaries,
  getLatestSummary,
  triggerJobNow
} = require("../controllers/summaryController");

// GET /api/summaries - all summaries
router.get("/", getAllSummaries);

// GET /api/summaries/latest - latest summary
router.get("/latest", getLatestSummary);

// POST /api/summaries/trigger - run job manually
router.post("/trigger", triggerJobNow);

module.exports = router;