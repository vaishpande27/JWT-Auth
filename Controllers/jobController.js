const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const Job = require('../model/job');
const User = require('../model/User');
const JobApplication = require('../model/JobApplications');

exports.create_job = (req, res) => {
  res.render('jobPosting');
};

exports.createJob = async (req, res) => {
  try {
    const { title, description, skills, salary, location } = req.body;

    if (!title || !description || !skills || !salary || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const job = new Job({
      title,
      description,
      skills,
      salary,
      location,
      recruiterId: req.user.id
    });

    await job.save();
    res.status(201).json({ message: "Job posted successfully!" });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.showAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    let appliedJobs = [];
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const applications = await JobApplication.find({ userId }).select('jobId');
      appliedJobs = applications.map(app => app.jobId.toString());
    }

    res.render('userJobs', { jobs, appliedJobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).send("Failed to load jobs");
  }
};

exports.showApplyForm = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.jobSlug }).lean();
    if (!job) return res.status(404).send("Job not found");
    res.render('applyJobs', { job });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.submitApplication = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.jobSlug });
    if (!job) return res.status(404).send("Job not found");

    const jobId = job._id;
    const userId = req.user.id;
    const { name, email, coverLetter, experience, linkedin, portfolio, github } = req.body;
    const resumePath = req.file?.path;

    if (!name || !email || !coverLetter || !experience || !resumePath) {
      return res.render('applyJobs', { job, error: "Please fill all required fields." });
    }

    const ext = path.extname(req.file.originalname);
    const applicantFileName = `${name.replace(/\s+/g, '_')}_CV${ext}`;
    const fileData = fs.readFileSync(resumePath);

    const application = new JobApplication({
      userId,
      jobId,
      name,
      email,
      resume: {
        data: fileData,
        contentType: req.file.mimetype,
        fileName: applicantFileName,
      },
      coverLetter,
      experience,
      linkedin,
      portfolio,
      github
    });

    await application.save();

    fs.unlink(resumePath, err => {
      if (err) console.error("Failed to delete file:", err);
    });

    res.send("Application submitted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.viewApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.jobSlug }).lean();
    if (!job) return res.status(404).send("Job not found");

    const applications = await JobApplication.find({ jobId: job._id }).populate('userId').lean();
    res.render('viewApplicants', { job, applications });
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).send("Server error");
  }
};

exports.viewResume = async (req, res) => {
  try {
    const application = await JobApplication.findOne({ slug: req.params.applicantSlug }).lean();

    if (!application || !application.resume || !application.resume.data) {
      return res.status(404).send("Resume not found");
    }

    const base64Data = application.resume.data.toString('base64');
    const mimeType = application.resume.contentType;

    res.render('viewResume', {
      resumeData: `data:${mimeType};base64,${base64Data}`,
      fileName: application.resume.fileName
    });
  } catch (err) {
    console.error("Error displaying resume:", err);
    res.status(500).send("Server error");
  }
};
