const Job = require("../models/Job");
const mongoose = require("mongoose");

// create job
const createJob = async (req, res) => {
  try {
    const { company, role, status, dateOfApplication, link } = req.body;

    if (!company || !role || !status || !dateOfApplication || !link) {
      return res.status(400).json({
        message: "Validation Error",
        details: "All fields are required",
      });
    }

    const job = await Job.create({
      company: company.trim(),
      role: role.trim(),
      status: status.trim(),
      dateOfApplication: dateOfApplication.trim(),
      link: link.trim(),
      user: req.user.id,  // Associating the job with the logged-in user
    });

    res.status(201).json(job);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Failed",
        details: error.message,
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).lean(); // Only jobs for the logged-in user
    return res.status(200).json({
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// fetch job
const getJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid job id" });
    }
    const job = await Job.findById(id).where('user').equals(req.user.id); // Only jobs created by the logged-in user
    if (!job) return res.status(404).json({ error: "job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid job id" });
    }
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
    }).where('user').equals(req.user.id);  // Ensure job belongs to the logged-in user
    if (!updatedJob) return res.status(404).json({ error: "job not found" });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid job id" });
    }
    const deletedJob = await Job.findByIdAndDelete(id).where('user').equals(req.user.id); // Only delete jobs created by the user
    if (!deletedJob) return res.status(404).json({ error: "job not found" });
    res.json({ message: "job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createJob, getAllJobs, getJob, updateJob, deleteJob };
