const express=require('express')
const applicantController = require('../Controllers/applicantController')
const upload = require('../config/multer');
const { requireAuth } = require('../middlewares/authmiddleware');

const router=express.Router();

// GET setup/edit profile form
router.get('/setup-profile', requireAuth, applicantController.renderSetupOrEditForm);

// Unified POST handler for both new setup and updates
router.post('/submit-profile', requireAuth, upload.single('resume'), applicantController.handleProfileSubmit);
// Dashboard
router.get('/Dashboard', applicantController.userDashboard);

router.get('/view-resume', requireAuth, applicantController.viewResume);

module.exports = router;