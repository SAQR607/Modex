const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Competition = sequelize.define('Competition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed'),
    defaultValue: 'draft'
  },
  maxTeams: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Competitions',
  timestamps: true
});

module.exports = Competition;
