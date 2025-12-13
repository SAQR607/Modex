const express = require('express');
const router = express.Router();
const {
  assignJudge,
  getJudges,
  scoreSubmission,
  getSubmissionsForJudging
} = require('../controllers/judgeController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/assign', authenticate, authorize('admin'), assignJudge);
router.get('/:competitionId', getJudges);
router.post('/score', authenticate, authorize('judge'), scoreSubmission);
router.get('/submissions/:competitionId/:stageId', authenticate, authorize('judge'), getSubmissionsForJudging);

module.exports = router;

