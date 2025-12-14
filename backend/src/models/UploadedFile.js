const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UploadedFile = sequelize.define('UploadedFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  stageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Stages',
      key: 'id'
    }
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'UploadedFiles',
  timestamps: false
});

module.exports = UploadedFile;

