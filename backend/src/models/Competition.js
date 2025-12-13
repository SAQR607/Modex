const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Competition = sequelize.define('Competition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'finished'),
    defaultValue: 'draft'
  },
  maxQualifiedUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  currentQualifiedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'Competitions',
  timestamps: true
});

module.exports = Competition;

