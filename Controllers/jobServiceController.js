const Job = require('../model/job');
const slugify = require('slugify');


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

exports.delete_job = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send('Unauthorized');
    }

    const job = await Job.findOne({ slug: req.params.jobSlug });

    if (!job) return res.status(404).send('Job not found');

    await Job.findByIdAndDelete(job._id);
    res.redirect('/jobs');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


exports.edit_get = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.jobSlug });

    if (!job) return res.status(404).send('Job not found');

    if (req.user.role !== 'admin') {
      return res.status(403).send('Unauthorized');
    }

    res.render('editJob', { job });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.edit_post = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.jobSlug });

    if (!job) return res.status(404).send('Job not found');

    if (req.user.role !== 'admin') {
      return res.status(403).send('Unauthorized');
    }

    const { title, description, skills, salary, location } = req.body;
    job.title = title;
    job.description = description;
    job.skills = skills.split(',').map(s => s.trim());
    job.salary = salary;
    job.location = location;

    await job.save();
    res.redirect('/jobs');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
