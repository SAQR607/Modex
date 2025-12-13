const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getTeamSubmission
} = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, createSubmission);
router.get('/stage/:stageId', authenticate, authorize('admin', 'judge'), getSubmissions);
router.get('/my-submission/:stageId', authenticate, getTeamSubmission);

module.exports = router;

