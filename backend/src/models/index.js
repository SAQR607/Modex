const sequelize = require('../config/database');
const User = require('./User');
const Competition = require('./Competition');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const QualificationQuestion = require('./QualificationQuestion');
const QualificationAnswer = require('./QualificationAnswer');
const Stage = require('./Stage');
const Judge = require('./Judge');
const Score = require('./Score');
const UploadedFile = require('./UploadedFile');

// User relationships
User.hasMany(Team, { foreignKey: 'leaderId', as: 'ledTeams' });
Team.belongsTo(User, { foreignKey: 'leaderId', as: 'leader' });
User.hasMany(TeamMember, { foreignKey: 'userId', as: 'teamMemberships' });
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(QualificationAnswer, { foreignKey: 'userId', as: 'qualificationAnswers' });
QualificationAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Judge, { foreignKey: 'userId', as: 'judgeProfile' });
Judge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Team relationships
Team.hasMany(TeamMember, { foreignKey: 'teamId', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(Score, { foreignKey: 'teamId', as: 'scores' });
Score.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(UploadedFile, { foreignKey: 'teamId', as: 'uploadedFiles' });
UploadedFile.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Competition relationships
Competition.hasMany(Stage, { foreignKey: 'competitionId', as: 'stages' });
Stage.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });
Competition.hasMany(QualificationQuestion, { foreignKey: 'competitionId', as: 'qualificationQuestions' });
QualificationQuestion.belongsTo(Competition, { foreignKey: 'competitionId', as: 'competition' });

// Stage relationships
Stage.hasMany(Score, { foreignKey: 'stageId', as: 'scores' });
Score.belongsTo(Stage, { foreignKey: 'stageId', as: 'stage' });
Stage.hasMany(UploadedFile, { foreignKey: 'stageId', as: 'uploadedFiles' });
UploadedFile.belongsTo(Stage, { foreignKey: 'stageId', as: 'stage' });

// Qualification relationships
QualificationQuestion.hasMany(QualificationAnswer, { foreignKey: 'questionId', as: 'answers' });
QualificationAnswer.belongsTo(QualificationQuestion, { foreignKey: 'questionId', as: 'question' });

// Judge relationships
Judge.hasMany(Score, { foreignKey: 'judgeId', as: 'scores' });
Score.belongsTo(Judge, { foreignKey: 'judgeId', as: 'judge' });

module.exports = {
  sequelize,
  User,
  Competition,
  Team,
  TeamMember,
  QualificationQuestion,
  QualificationAnswer,
  Stage,
  Judge,
  Score,
  UploadedFile
};
