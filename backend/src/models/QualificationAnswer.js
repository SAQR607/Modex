const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualificationAnswer = sequelize.define('QualificationAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'QualificationQuestions',
      key: 'id'
    }
  },
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Competitions',
      key: 'id'
    }
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'QualificationAnswers',
  timestamps: true
});

module.exports = QualificationAnswer;

