const Job = require('../model/job');
const JobApplication = require('../model/JobApplications');

module.exports.admin = async (req, res) => {
  try {
    const stats = {
      activeJobs: await Job.countDocuments({ status: 'active' }), // Filter only active jobs
      totalApplicants: await JobApplication.countDocuments(), // Counts all applications
      shortlisted: await JobApplication.countDocuments({ status: 'shortlisted' }),
      // interviews: await JobApplication.countDocuments({ status: 'interview' }) // Uncomment if needed
    };

    res.render('adminPanel', { stats });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).send("Server Error");
  }
};

module.exports.user = (req, res) => {
  res.render('userPanel');
};
