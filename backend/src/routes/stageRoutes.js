const express = require('express');
const router = express.Router();
const {
  createStage,
  getStages,
  updateStage,
  deleteStage
} = require('../controllers/stageController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('admin'), createStage);
router.get('/:competitionId', getStages);
router.put('/:id', authenticate, authorize('admin'), updateStage);
router.delete('/:id', authenticate, authorize('admin'), deleteStage);

module.exports = router;

