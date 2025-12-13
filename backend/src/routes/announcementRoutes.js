const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements
} = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.get('/:competitionId', authenticate, getAnnouncements);

module.exports = router;

