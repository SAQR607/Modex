const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stage = sequelize.define('Stage', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('qualification', 'submission', 'evaluation'),
    allowNull: false
  }
}, {
  tableName: 'Stages',
  timestamps: true
});

module.exports = Stage;
