const { Sequelize } = require('sequelize');

// Load .env safely (optional)
try {
  require('dotenv').config();
} catch (error) {
  // .env is optional
}

// Create sequelize instance with safe defaults
// Server will start even if database credentials are missing
// All values come from environment variables or safe defaults
const sequelize = new Sequelize(
  process.env.DB_NAME || 'modex_platform',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Don't fail on connection errors - let app.js handle them
    retry: {
      max: 0
    },
    // Prevent connection errors from crashing the app
    dialectOptions: {
      connectTimeout: 10000
    }
  }
);

module.exports = sequelize;

