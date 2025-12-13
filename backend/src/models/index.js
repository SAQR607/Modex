const sequelize = require('../config/database');
const User = require('./User');
const Competition = require('./Competition');
const Team = require('./Team');
const QualificationQuestion = require('./QualificationQuestion');
const QualificationAnswer = require('./QualificationAnswer');
const Stage = require('./Stage');
const Submission = require('./Submission');
const Judge = require('./Judge');
const Score = require('./Score');
const Announcement = require('./Announcement');

// Define relationships
User.hasOne(Team, { foreignKey: 'leaderId', as: 'ledTeam' });
Team.belongsTo(User, { foreignKey: 'leaderId', as: 'leader' });
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Competition.hasMany(Team, { foreignKey: 'competitionId', as: 'teams' });
Team.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

Competition.hasMany(QualificationQuestion, { foreignKey: 'competitionId', as: 'qualificationQuestions' });
QualificationQuestion.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

User.hasMany(QualificationAnswer, { foreignKey: 'userId', as: 'qualificationAnswers' });
QualificationAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
QualificationQuestion.hasMany(QualificationAnswer, { foreignKey: 'questionId', as: 'answers' });
QualificationAnswer.belongsTo(QualificationQuestion, { foreignKey: 'questionId', as: 'question' });
Competition.hasMany(QualificationAnswer, { foreignKey: 'competitionId', as: 'qualificationAnswers' });
QualificationAnswer.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

Competition.hasMany(Stage, { foreignKey: 'competitionId', as: 'stages' });
Stage.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

Team.hasMany(Submission, { foreignKey: 'teamId', as: 'submissions' });
Submission.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Stage.hasMany(Submission, { foreignKey: 'stageId', as: 'submissions' });
Submission.belongsTo(Stage, { foreignKey: 'stageId', as: 'stage' });
Competition.hasMany(Submission, { foreignKey: 'competitionId', as: 'submissions' });
Submission.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

Competition.hasMany(Judge, { foreignKey: 'competitionId', as: 'judges' });
Judge.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });
User.hasMany(Judge, { foreignKey: 'userId', as: 'judgeAssignments' });
Judge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Submission.hasMany(Score, { foreignKey: 'submissionId', as: 'scores' });
Score.belongsTo(Submission, { foreignKey: 'submissionId', as: 'submission' });
Judge.hasMany(Score, { foreignKey: 'judgeId', as: 'scores' });
Score.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });

Competition.hasMany(Announcement, { foreignKey: 'competitionId', as: 'announcements' });
Announcement.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

module.exports = {
  sequelize,
  User,
  Competition,
  Team,
  QualificationQuestion,
  QualificationAnswer,
  Stage,
  Submission,
  Judge,
  Score,
  Announcement
};

