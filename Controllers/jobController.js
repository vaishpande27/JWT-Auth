const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const Job = require('../model/job');
const User = require('../model/User');
const JobApplication = require('../model/JobApplications');
const { getSemanticScores } = require('../utils/semanticScorer');
const calculateATSScore = require('../utils/scoreCalculator');
const pdfParse = require('pdf-parse');



exports.showAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    let appliedJobs = [];
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const applications = await JobApplication.find({ userId }).select('jobId');
      appliedJobs = applications.map(app => app.jobId.toString());
    }

    res.render('userJobs', { jobs, appliedJobs, user: req.user });
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
    if (!resumePath || !fs.existsSync(resumePath)) {
      return res.render('applyJobs', { job, error: "Resume file is missing or not uploaded properly." });
    }

    if (!name || !email || !coverLetter || !experience || !resumePath) {
      return res.render('applyJobs', { job, error: "Please fill all required fields." });
    }

    const ext = path.extname(req.file.originalname);
    const applicantFileName = `${name.replace(/\s+/g, '_')}_CV${ext}`;
    const fileData = fs.readFileSync(resumePath);
    if (!fileData || fileData.length === 0) {
      console.error("❌ Resume buffer is empty!");
      return res.status(400).send("Resume file is invalid or empty.");
    }

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


    application.slug = slugify(name + '-' + jobId.toString(), { lower: true });
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

exports.evaluateApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.jobSlug }).lean();
    // const applicants = await JobApplication.find({ jobId: job._id });
    const applicants = await JobApplication.find({
      jobId: job._id,
      status: 'applied'
    });


    const jobText = `${job.title} ${job.description} ${job.skills.join(' ')}`;
    // console.log("JobText:", jobText);

    applicants.forEach(app => {
      if (!app.resume || !app.resume.data) {
        console.warn(`⚠️ ${app.name} has no resume data.`);
      } else {
        console.log(`✅ ${app.name} resume buffer length:`, app.resume.data.length);
      }
    });

    const resumeTexts = await Promise.all(applicants.map(async app => {
      try {
        if (app.resume && app.resume.data && app.resume.contentType.includes('pdf')) {
          const pdf = await pdfParse(app.resume.data);
          return `${pdf.text} ${app.experience || ''}`;
        } else if (app.resume && app.resume.data) {
          return `${app.resume.data.toString('utf-8')} ${app.experience || ''}`;
        } else {
          return `${app.experience || ''}`; // No resume found
        }
      } catch (err) {
        console.error(`❌ Failed to parse resume for ${app.name}:`, err.message);
        return `${app.experience || ''}`;
      }
    }));

    const scores = await getSemanticScores(jobText, resumeTexts);

    const scored = [];

    for (let i = 0; i < applicants.length; i++) {
      const app = applicants[i];
      const resumeText = resumeTexts[i];
      const scoreObj = calculateATSScore({ ...app.toObject(), resumeText }, job, scores[i]);

      // Save ATS score to MongoDB
      app.atsScore = scoreObj.finalScore;
      try {
        await app.save();
        console.log(`✅ Saved ATS score for ${app.name}: ${app.atsScore}`);
      } catch (err) {
        console.error(`❌ Failed to save ATS score for ${app.name}`, err.message);
      }

      scored.push({ ...app.toObject(), ...scoreObj });
    }

    scored.sort((a, b) => b.finalScore - a.finalScore);


    res.render('evaluateApplicants', { job, applications: scored });
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).send("Server error");
  }
};

exports.shortlisted = async (req, res) => {
  const { slug } = req.params;

  try {
    const application = await JobApplication.findOne({ slug });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    application.shortlisted = true;
    application.status = 'shortlisted';
    await application.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.shortlisted_get = async (req, res) => {
  try {
    const { search = '', job = '', score = '' } = req.query;

    const applications = await JobApplication.find({ status: 'shortlisted' })
      .populate('jobId')
      .populate('userId');

    const grouped = {};

    applications.forEach(app => {
      const user = app.userId;
      const jobTitle = app.jobId.title;
      const ats = app.atsScore || 0;

      // Apply search filter
      // Match search if provided
      const nameMatch = user.name?.toLowerCase().includes(search.toLowerCase());
      const emailMatch = user.email?.toLowerCase().includes(search.toLowerCase());
      const jobMatch = job ? jobTitle === job : true;
      const scoreMatch =
        score === '80' ? ats >= 80 :
        score === '60' ? ats >= 60 && ats < 80 :
        score === '0' ? ats < 60 :
        true;

      if ((search && !(nameMatch || emailMatch)) || !jobMatch || !scoreMatch) return;


      // Apply job filter
      if (job && job !== jobTitle) return;

      // Apply score filter
      if (score === '80' && ats < 80) return;
      if (score === '60' && (ats < 60 || ats >= 80)) return;
      if (score === '0' && ats >= 60) return;

      const userId = user._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = {
          user: {
            name: app.name,
            email: app.email,
            _id: userId,
          },
          applications: [],
          atsScore: ats
        };
      }

      grouped[userId].applications.push({
        jobTitle: jobTitle,
        resumeSlug: app.slug
      });

      if (ats > grouped[userId].atsScore) {
        grouped[userId].atsScore = ats;
      }
    });

    const candidates = Object.values(grouped);

    // Get all unique job titles for dropdown
    const allJobs = await Job.find({}, 'title');
    const jobTitles = allJobs.map(job => job.title);
    
    res.render('shortlisted', {
      candidates,
      jobTitles,
      search,
      jobFilter: job,
      scoreFilter: score
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};


exports.rejected = async (req, res) => {
  try {
    const app = await JobApplication.findOne({ slug: req.params.slug });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    app.status = 'rejected';
    await app.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error rejecting candidate:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


