const express=require('express')
const applicantController = require('../Controllers/applicantController')
const upload = require('../config/multer');
const { requireAuth } = require('../middlewares/authmiddleware');

const router=express.Router();

// GET form
router.get('/setup-profile', requireAuth, applicantController.renderSetupForm);
// POST form
router.post('/setup-profile',requireAuth, upload.single('resume'), applicantController.saveProfile);

router.post('/update-profile', requireAuth, upload.single('resume'), applicantController.saveProfile);


// Dashboard
router.get('/Dashboard', applicantController.userDashboard);

router.get('/view-resume', requireAuth, applicantController.viewResume);

module.exports = router;