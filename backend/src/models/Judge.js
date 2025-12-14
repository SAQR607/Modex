const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Judge = sequelize.define('Judge', {
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
  }
}, {
  tableName: 'Judges',
  timestamps: true
});

module.exports = Judge;
