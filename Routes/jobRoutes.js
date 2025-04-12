const express = require('express');
const { requireRole, requireAuth } = require('../middlewares/authmiddleware');
const jobController = require('../Controllers/jobController');
const upload = require('../config/multer');

const router = express.Router();

router.get('/create', requireRole('admin'), jobController.create_job);
router.post('/create', requireRole('admin'), jobController.createJob);

router.get('/', requireAuth, jobController.showAllJobs);

router.get("/apply/:jobSlug", requireAuth, jobController.showApplyForm);
router.post("/apply/:jobSlug", requireAuth, upload.single('resume'), jobController.submitApplication);

router.get('/view-resume/:applicantSlug', requireRole('admin'), jobController.viewResume);
router.get('/:jobSlug/applicants', requireRole('admin'), jobController.viewApplicants);

module.exports = router;
