const express = require("express");
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

// middleware added to POST and PUT routes
router.post("/jobs/create", createJob);
router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);

module.exports = router;
