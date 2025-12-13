const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualificationQuestion = sequelize.define('QualificationQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Competitions',
      key: 'id'
    }
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'multiple_choice', 'file_upload'),
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'QualificationQuestions',
  timestamps: true
});

module.exports = QualificationQuestion;

