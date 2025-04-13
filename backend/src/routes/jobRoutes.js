const express = require("express");
const router = express.Router();
const { createJob, getAllJobs, getJob, updateJob, deleteJob } = require("../controllers/jobController");

router.route("/jobs")
  .get(getAllJobs)
  .post(createJob);

router.route("/jobs/:id")
  .get(getJob)
  .put(updateJob)
  .delete(deleteJob);

module.exports = router;