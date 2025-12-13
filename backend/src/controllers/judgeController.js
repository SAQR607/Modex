const { Judge, User, Competition, Submission, Score } = require('../models');

const assignJudge = async (req, res) => {
  try {
    const { userId, competitionId } = req.body;

    const competition = await Competition.findByPk(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'judge') {
      user.role = 'judge';
      await user.save();
    }

    const existingJudge = await Judge.findOne({
      where: { userId, competitionId }
    });

    if (existingJudge) {
      return res.status(400).json({ error: 'Judge already assigned to this competition' });
    }

    const judges = await Judge.findAll({ where: { competitionId } });
    if (judges.length >= 3) {
      return res.status(400).json({ error: 'Maximum 3 judges per competition' });
    }

    const judge = await Judge.create({
      userId,
      competitionId
    });

    res.status(201).json({ judge });
  } catch (error) {
    console.error('Assign judge error:', error);
    res.status(500).json({ error: 'Failed to assign judge' });
  }
};

const getJudges = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const judges = await Judge.findAll({
      where: { competitionId },
      include: [{ association: 'user' }]
    });

    res.json({ judges });
  } catch (error) {
    console.error('Get judges error:', error);
    res.status(500).json({ error: 'Failed to fetch judges' });
  }
};

const scoreSubmission = async (req, res) => {
  try {
    const { submissionId, score, comments } = req.body;
    const judgeId = req.user.id;

    const judge = await Judge.findOne({ where: { userId: judgeId } });
    if (!judge) {
      return res.status(403).json({ error: 'User is not a judge' });
    }

    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const existingScore = await Score.findOne({
      where: { submissionId, judgeId: judge.id }
    });

    if (existingScore) {
      existingScore.score = score;
      existingScore.comments = comments || existingScore.comments;
      await existingScore.save();
      return res.json({ score: existingScore });
    }

    const newScore = await Score.create({
      submissionId,
      judgeId: judge.id,
      score,
      comments
    });

    res.status(201).json({ score: newScore });
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: 'Failed to score submission' });
  }
};

const getSubmissionsForJudging = async (req, res) => {
  try {
    const { competitionId, stageId } = req.params;
    const judgeId = req.user.id;

    const judge = await Judge.findOne({ where: { userId: judgeId, competitionId } });
    if (!judge) {
      return res.status(403).json({ error: 'Not assigned as judge for this competition' });
    }

    const submissions = await Submission.findAll({
      where: { competitionId, stageId },
      include: [
        { association: 'team', include: [{ association: 'members' }] },
        { association: 'stage' },
        {
          association: 'scores',
          where: { judgeId: judge.id },
          required: false
        }
      ]
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions for judging error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

module.exports = {
  assignJudge,
  getJudges,
  scoreSubmission,
  getSubmissionsForJudging
};

