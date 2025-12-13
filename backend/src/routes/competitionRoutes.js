const express = require('express');
const router = express.Router();
const {
  createCompetition,
  getCompetitions,
  getCompetition,
  updateCompetition,
  deleteCompetition
} = require('../controllers/competitionController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('admin'), createCompetition);
router.get('/', getCompetitions);
router.get('/:id', getCompetition);
router.put('/:id', authenticate, authorize('admin'), updateCompetition);
router.delete('/:id', authenticate, authorize('admin'), deleteCompetition);

module.exports = router;

