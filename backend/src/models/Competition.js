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
    allowNull: false,
    field: 'name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed'),
    defaultValue: 'draft'
  },
  maxQualifiedUsers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 100,
    field: 'max_qualified_users'
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'banner_image'
  }
}, {
  tableName: 'competitions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Competition;
