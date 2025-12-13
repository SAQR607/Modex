const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inviteCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Competitions',
      key: 'id'
    }
  },
  leaderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDisqualified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'Teams',
  timestamps: true
});

module.exports = Team;

