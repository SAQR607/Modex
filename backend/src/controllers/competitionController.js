const { Competition, Stage, QualificationQuestion, Team, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');

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
    cb(null, 'competition-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 67108864 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed for banners'));
  }
});

const createCompetition = catchAsync(async (req, res, next) => {
  console.log('🔍 CREATE COMPETITION: Request received');
  console.log('📋 CREATE COMPETITION: Request body:', JSON.stringify(req.body, null, 2));
  console.log('📋 CREATE COMPETITION: File uploaded:', req.file ? req.file.filename : 'none');
  
  const { name, description, maxQualifiedUsers } = req.body;
  const bannerImage = req.file ? req.file.path : null;

  // Validation
  if (!name || name.trim().length < 1) {
    return res.status(400).json({ error: 'Competition name is required' });
  }

  if (maxQualifiedUsers && (isNaN(maxQualifiedUsers) || maxQualifiedUsers < 1)) {
    return res.status(400).json({ error: 'Max qualified users must be a positive number' });
  }

  console.log('🔍 CREATE COMPETITION: Attempting to create competition in database...');
  console.log('📋 CREATE COMPETITION: Data to insert:', {
    name: name.trim(),
    description: description ? description.trim() : null,
    bannerImage,
    maxQualifiedUsers: maxQualifiedUsers || 100,
    status: 'draft'
  });

  const competition = await Competition.create({
    name: name.trim(),
    description: description ? description.trim() : null,
    bannerImage,
    maxQualifiedUsers: maxQualifiedUsers || 100,
    status: 'draft'
  });

  console.log('✅ CREATE COMPETITION: Competition created successfully:', {
    id: competition.id,
    name: competition.name,
    status: competition.status
  });

  res.status(201).json({ competition });
});

const getCompetitions = catchAsync(async (req, res, next) => {
  console.log('🔍 GET COMPETITIONS: Starting fetch...');
  
  // Fetch competitions - simplified to avoid association errors
  const competitions = await Competition.findAll({
    order: [['created_at', 'DESC']]
  });

  console.log('✅ GET COMPETITIONS: Fetched from database:', competitions.length, 'competitions');
  console.log('📋 GET COMPETITIONS: Competition data:', JSON.stringify(competitions, null, 2));

  res.json({ competitions });
});

const getCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await Competition.findByPk(id, {
      include: [
        { association: 'stages', order: [['order', 'ASC']] },
        { association: 'teams', include: [{ association: 'members' }] },
        { association: 'qualificationQuestions', order: [['order', 'ASC']] },
        { association: 'judges', include: [{ association: 'user' }] }
      ]
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json({ competition });
  } catch (error) {
    console.error('Get competition error:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
};

const updateCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, maxQualifiedUsers } = req.body;

    const competition = await Competition.findByPk(id);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (req.file) {
      if (competition.bannerImage && fs.existsSync(competition.bannerImage)) {
        fs.unlinkSync(competition.bannerImage);
      }
      competition.bannerImage = req.file.path;
    }

    if (name) competition.name = name;
    if (description) competition.description = description;
    if (status) competition.status = status;
    if (maxQualifiedUsers) competition.maxQualifiedUsers = maxQualifiedUsers;

    await competition.save();

    res.json({ competition });
  } catch (error) {
    console.error('Update competition error:', error);
    res.status(500).json({ error: 'Failed to update competition' });
  }
};

const deleteCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.bannerImage && fs.existsSync(competition.bannerImage)) {
      fs.unlinkSync(competition.bannerImage);
    }

    await competition.destroy();
    res.json({ message: 'Competition deleted successfully' });
  } catch (error) {
    console.error('Delete competition error:', error);
    res.status(500).json({ error: 'Failed to delete competition' });
  }
};

module.exports = {
  createCompetition: [upload.single('bannerImage'), createCompetition],
  getCompetitions,
  getCompetition,
  updateCompetition: [upload.single('bannerImage'), updateCompetition],
  deleteCompetition
};

