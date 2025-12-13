const { Announcement, Competition } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'announcement-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 67108864 }
});

const createAnnouncement = async (req, res) => {
  try {
    const { competitionId, title, message } = req.body;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const announcement = await Announcement.create({
      competitionId,
      title,
      message,
      filePath: req.file ? req.file.path : null
    });

    res.status(201).json({ announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const announcements = await Announcement.findAll({
      where: { competitionId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

module.exports = {
  createAnnouncement: [upload.single('file'), createAnnouncement],
  getAnnouncements
};

