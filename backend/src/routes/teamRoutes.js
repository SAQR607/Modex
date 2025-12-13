const express = require('express');
const router = express.Router();
const {
  createTeam,
  joinTeam,
  getTeam,
  assignTeamRole,
  getTeams,
  disqualifyIncompleteTeams
} = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, createTeam);
router.post('/join', authenticate, joinTeam);
router.get('/my-team', authenticate, getTeam);
router.put('/assign-role', authenticate, assignTeamRole);
router.get('/competition/:competitionId', authenticate, getTeams);
router.post('/disqualify/:competitionId', authenticate, authorize('admin'), disqualifyIncompleteTeams);

module.exports = router;

