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
User.hasMany(Team, { foreignKey: 'leaderId', onDelete: 'SET NULL' });
Team.belongsTo(User, { foreignKey: 'leaderId' });

User.hasMany(TeamMember, { foreignKey: 'userId', onDelete: 'CASCADE' });
TeamMember.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(QualificationAnswer, { foreignKey: 'userId', onDelete: 'CASCADE' });
QualificationAnswer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Judge, { foreignKey: 'userId', onDelete: 'CASCADE' });
Judge.belongsTo(User, { foreignKey: 'userId' });

// Team relationships
Team.hasMany(TeamMember, { foreignKey: 'teamId', onDelete: 'CASCADE' });
TeamMember.belongsTo(Team, { foreignKey: 'teamId' });

Team.hasMany(Score, { foreignKey: 'teamId', onDelete: 'CASCADE' });
Score.belongsTo(Team, { foreignKey: 'teamId' });

Team.hasMany(UploadedFile, { foreignKey: 'teamId', onDelete: 'CASCADE' });
UploadedFile.belongsTo(Team, { foreignKey: 'teamId' });

// Competition relationships
Competition.hasMany(Stage, { foreignKey: 'competitionId', onDelete: 'CASCADE' });
Stage.belongsTo(Competition, { foreignKey: 'competitionId' });

Competition.hasMany(QualificationQuestion, { foreignKey: 'competitionId', onDelete: 'CASCADE' });
QualificationQuestion.belongsTo(Competition, { foreignKey: 'competitionId' });

// Stage relationships
Stage.hasMany(Score, { foreignKey: 'stageId', onDelete: 'CASCADE' });
Score.belongsTo(Stage, { foreignKey: 'stageId' });

Stage.hasMany(UploadedFile, { foreignKey: 'stageId', onDelete: 'CASCADE' });
UploadedFile.belongsTo(Stage, { foreignKey: 'stageId' });

// Qualification relationships
QualificationQuestion.hasMany(QualificationAnswer, { foreignKey: 'questionId', onDelete: 'CASCADE' });
QualificationAnswer.belongsTo(QualificationQuestion, { foreignKey: 'questionId' });

// Judge relationships
Judge.hasMany(Score, { foreignKey: 'judgeId', onDelete: 'CASCADE' });
Score.belongsTo(Judge, { foreignKey: 'judgeId' });

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
