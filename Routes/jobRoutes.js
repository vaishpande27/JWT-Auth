const express = require('express');
const { requireRole, requireAuth } = require('../middlewares/authmiddleware');
const jobController = require('../Controllers/jobController');
const jobServices= require('../Controllers/jobServiceController');
const upload = require('../config/multer');

const router = express.Router();

router.get('/post-job', requireRole('admin'), jobServices.create_job);
router.post('/post-job', requireRole('admin'), jobServices.createJob);

router.get('/edit-job/:jobSlug',requireRole('admin'),jobServices.edit_get)
router.post('/edit-post/:jobSlug',requireRole('admin'),jobServices.edit_post)
router.post('/delete/:jobSlug',requireRole('admin'),jobServices.delete_job)

router.get('/', requireAuth, jobController.showAllJobs);

router.get("/apply/:jobSlug", requireAuth, jobController.showApplyForm);
router.post("/apply/:jobSlug", requireAuth, upload.single('resume'), jobController.submitApplication);

router.get('/view-resume/:applicantSlug', requireRole('admin'), jobController.viewResume);
router.get('/:jobSlug/applicants', requireRole('admin'), jobController.viewApplicants);

router.get('/:jobSlug/evaluate', requireRole('admin'), jobController.evaluateApplicants);

router.post('/shortlist/:slug', jobController.shortlisted);
router.get('/shortlisted', jobController.shortlisted_get);

router.post('/reject/:slug',jobController.rejected);
  
module.exports = router;
