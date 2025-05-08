const fs = require('fs');
const path = require('path');
const userInfo = require('../model/userInfo');

module.exports.renderSetupForm = (req, res) => {
    const email = req.user.email; // Email from JWT
    res.render('setupUserProfile', { email });
};


module.exports.saveProfile = async (req, res) => {
    try {
        const { name, phone, linkedin, portfolio, github } = req.body;
        const email = req.user?.email; // From JWT


        // ✅ Validate file exists on disk
        if (!req.file || !fs.existsSync(req.file.path)) {
            return res.render('setupUserProfile', { error: "Resume file is missing or not uploaded properly." });
        }

        // ✅ Validate required fields
        if (!name || !email || !phone || !github) {
            return res.render('setupUserProfile', { error: "Please fill all required fields." });
        }

        // ✅ Read file from disk
        const fileBuffer = fs.readFileSync(req.file.path);

        const user = new userInfo({
            name,
            email,
            phone,
            linkedin,
            portfolio,
            github,
            resume: {
                data: fileBuffer,
                contentType: req.file.mimetype,
                fileName: req.file.filename, // from multer.diskStorage
            },
        });
        // console.log("Saving userInfo with values:", userInfo);

        await user.save();

        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
            else console.log("Temporary resume file deleted.");
        });
        console.log("Redirecting with email:", email);
        res.redirect(`/user/Dashboard?email=${email}`);

    } catch (err) {
        console.error('Error saving profile:', err.message, err.stack);
        res.status(500).send("Something went wrong.");
    }
};

module.exports.userDashboard = async (req, res) => {
    const email = req.query.email?.trim().toLowerCase(); // or req.user.email
    console.log("Query email:", req.query.email);
    const user = await userInfo.findOne({ email });
    if (!user) return res.status(404).send("User not found");
    res.render('userDashboard', { user });
};

// Controller for viewing the resume
exports.viewResume = async (req, res) => {
    try {
        const user = await userInfo.findOne({ email: req.user.email }).lean(); // Using JWT email from req.user
        if (!user || !user.resume || !user.resume.data) {
            return res.status(404).send("Resume not found");
        }

        const base64Data = user.resume.data.toString('base64');
        const mimeType = user.resume.contentType;

        res.render('viewResume', {
            resumeData: `data:${mimeType};base64,${base64Data}`,
            fileName: user.resume.fileName
        });
    } catch (err) {
        console.error("Error displaying resume:", err);
        res.status(500).send("Server error");
    }
};
