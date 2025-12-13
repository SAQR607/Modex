const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  submitAnswers,
  uploadAnswerFile,
  getAnswers,
  approveUser
} = require('../controllers/qualificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/questions', authenticate, authorize('admin'), createQuestion);
router.get('/questions/:competitionId', getQuestions);
router.post('/answers/:competitionId', authenticate, submitAnswers);
router.post('/upload', authenticate, uploadAnswerFile);
router.get('/answers/:competitionId', authenticate, authorize('admin'), getAnswers);
router.post('/approve/:userId', authenticate, authorize('admin'), approveUser);

module.exports = router;

