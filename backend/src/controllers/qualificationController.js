const { QualificationQuestion, QualificationAnswer, Competition, User } = require('../models');
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
    cb(null, 'qualification-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 67108864 }
});

const createQuestion = async (req, res) => {
  try {
    const { competitionId, question, type, options, order, isRequired } = req.body;

    // Validation
    if (!competitionId || !question || !type) {
      return res.status(400).json({ error: 'Competition ID, question, and type are required' });
    }

    const validTypes = ['text', 'multiple_choice', 'file_upload'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid question type. Must be: text, multiple_choice, or file_upload' });
    }

    if (type === 'multiple_choice' && !options) {
      return res.status(400).json({ error: 'Options are required for multiple choice questions' });
    }

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const qualificationQuestion = await QualificationQuestion.create({
      competitionId,
      question,
      type,
      options: type === 'multiple_choice' ? (typeof options === 'string' ? JSON.parse(options) : options) : null,
      order: order || 0,
      isRequired: isRequired !== false
    });

    res.status(201).json({ question: qualificationQuestion });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const questions = await QualificationQuestion.findAll({
      where: { competitionId },
      order: [['order', 'ASC']]
    });

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const submitAnswers = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const questions = await QualificationQuestion.findAll({
      where: { competitionId, isRequired: true }
    });

    if (questions.length === 0) {
      return res.status(400).json({ error: 'No questions found for this competition' });
    }

    // Delete existing answers
    await QualificationAnswer.destroy({
      where: { userId, competitionId }
    });

    // Create new answers
    for (const answer of answers) {
      await QualificationAnswer.create({
        userId,
        questionId: answer.questionId,
        competitionId,
        answer: answer.answer,
        filePath: answer.filePath || null
      });
    }

    // Check if all required questions are answered
    const submittedAnswers = await QualificationAnswer.findAll({
      where: { userId, competitionId }
    });

    const allRequiredAnswered = questions.every(q =>
      submittedAnswers.some(a => a.questionId === q.id)
    );

    res.json({
      message: 'Answers submitted successfully',
      allRequiredAnswered
    });
  } catch (error) {
    console.error('Submit answers error:', error);
    res.status(500).json({ error: 'Failed to submit answers' });
  }
};

const uploadAnswerFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      filePath: req.file.path
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

const getAnswers = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const answers = await QualificationAnswer.findAll({
      where: { competitionId },
      include: [
        { association: 'user' },
        { association: 'question' }
      ]
    });

    res.json({ answers });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
};

const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { competitionId } = req.body;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.currentQualifiedCount >= competition.maxQualifiedUsers) {
      return res.status(400).json({ error: 'Maximum qualified users reached' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isQualified) {
      return res.status(400).json({ error: 'User already qualified' });
    }

    user.isQualified = true;
    user.qualifiedAt = new Date();
    user.role = 'leader';
    await user.save();

    competition.currentQualifiedCount += 1;
    await competition.save();

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  submitAnswers,
  uploadAnswerFile: [upload.single('file'), uploadAnswerFile],
  getAnswers,
  approveUser
};

