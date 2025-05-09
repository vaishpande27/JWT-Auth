const fs = require('fs');
const userInfo = require('../model/userInfo');

exports.renderSetupOrEditForm = async (req, res) => {
  const user = await userInfo.findOne({ email: req.user.email });

  res.render('setupUserProfile', {
    isEdit: user && user.name && user.phone,
    user: user || req.user, // pass full info if present, else only auth info
  });
};

exports.handleProfileSubmit = async (req, res) => {
  try {
    const email = req.user.email;
    const { name, phone, github, linkedin, portfolio, deleteResume } = req.body;

    if (!name || !email || !phone || !github) {
      return res.render('setupUserProfile', {
        isEdit: true,
        user: { ...req.body, email },
        error: "Please fill all required fields."
      });
    }

    let user = await userInfo.findOne({ email });

    // Handle resume upload if present
    let resumeData = null;
    if (req.file && fs.existsSync(req.file.path)) {
      resumeData = {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype,
        fileName: req.file.originalname
      };
    }

    if (!user) {
      // Create new user
      user = new userInfo({
        email,
        name,
        phone,
        github,
        linkedin,
        portfolio,
        resume: resumeData
      });
    } else {
      // Update existing user
      user.name = name;
      user.phone = phone;
      user.github = github;
      user.linkedin = linkedin;
      user.portfolio = portfolio;

      if (deleteResume === 'true') {
        user.resume = undefined;
      }

      if (resumeData) {
        user.resume = resumeData;
      }
    }

    await user.save();

    // Delete uploaded resume file from server
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, err => {
        if (err) console.error("Failed to delete resume:", err);
      });
    }

    res.redirect(`/user/Dashboard?email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Error handling profile submit:", err);
    res.status(500).send("Internal Server Error");
  }
};


exports.userDashboard = async (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  const user = await userInfo.findOne({ email });

  if (!user) {
    res.render('setupUserProfile', { isEdit: false, user: { email } });
  } else {
    res.render('userDashboard', { user });
  }
};

exports.viewResume = async (req, res) => {
  try {
    const user = await userInfo.findOne({ email: req.user.email }).lean();
    if (!user || !user.resume || !user.resume.data) {
      return res.status(404).send("Resume not found");
    }

    const base64Data = user.resume.data.toString('base64');
    res.render('viewResume', {
      resumeData: `data:${user.resume.contentType};base64,${base64Data}`,
      fileName: user.resume.fileName
    });
  } catch (err) {
    console.error("Error displaying resume:", err);
    res.status(500).send("Server error");
  }
};


