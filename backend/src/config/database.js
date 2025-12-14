const { Sequelize } = require('sequelize');
require('dotenv').config();

// Check if database environment variables are provided
const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;

let sequelize;

if (!hasDbConfig) {
  console.warn('⚠️ Database credentials loaded from environment at runtime.');
  // Create a dummy sequelize instance that won't crash on import
  // but will fail gracefully on actual use
  sequelize = {
    authenticate: async () => {
      throw new Error('Database not configured');
    },
    sync: async () => {
      throw new Error('Database not configured');
    },
    query: async () => {
      throw new Error('Database not configured');
    },
    define: () => ({})
  };
} else {
  // Create real sequelize instance
  try {
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'development' ? (msg) => console.log('[sequelize] ' + msg) : false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
      }
    );
  } catch (error) {
    console.error('⚠️ Database configuration error:', error.message);
    // Create dummy instance on error
    sequelize = {
      authenticate: async () => {
        throw new Error('Database configuration error');
      },
      sync: async () => {
        throw new Error('Database configuration error');
      },
      query: async () => {
        throw new Error('Database configuration error');
      },
      define: () => ({})
    };
  }
}

module.exports = sequelize;
