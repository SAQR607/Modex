const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Score', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Submissions',
      key: 'id'
    }
  },
  judgeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Judges',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Scores',
  timestamps: true
});

module.exports = Score;

