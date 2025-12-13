const { Submission, Stage, Team, Score } = require('../models');
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
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 67108864 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|xlsx?|csv|jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /pdf|excel|spreadsheet|csv|image/.test(file.mimetype);
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Allowed: PDF, Excel, CSV, Images'));
  }
});

const createSubmission = async (req, res) => {
  try {
    const { stageId, content } = req.body;
    const teamId = req.user.teamId;

    if (!teamId) {
      return res.status(403).json({ error: 'User must be in a team' });
    }

    const stage = await Stage.findByPk(stageId);
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    const existingSubmission = await Submission.findOne({
      where: { teamId, stageId }
    });

    if (existingSubmission) {
      if (req.file && existingSubmission.filePath && fs.existsSync(existingSubmission.filePath)) {
        fs.unlinkSync(existingSubmission.filePath);
      }
      existingSubmission.content = content || existingSubmission.content;
      existingSubmission.filePath = req.file ? req.file.path : existingSubmission.filePath;
      await existingSubmission.save();
      return res.json({ submission: existingSubmission });
    }

    const submission = await Submission.create({
      teamId,
      stageId,
      competitionId: stage.competitionId,
      content,
      filePath: req.file ? req.file.path : null
    });

    res.status(201).json({ submission });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { stageId } = req.params;
    const submissions = await Submission.findAll({
      where: { stageId },
      include: [
        { association: 'team', include: [{ association: 'members' }] },
        { association: 'stage' }
      ]
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

const getTeamSubmission = async (req, res) => {
  try {
    const { stageId } = req.params;
    const teamId = req.user.teamId;

    if (!teamId) {
      return res.status(403).json({ error: 'User must be in a team' });
    }

    const submission = await Submission.findOne({
      where: { teamId, stageId },
      include: [{ association: 'stage' }]
    });

    res.json({ submission });
  } catch (error) {
    console.error('Get team submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

module.exports = {
  createSubmission: [upload.single('file'), createSubmission],
  getSubmissions,
  getTeamSubmission
};

