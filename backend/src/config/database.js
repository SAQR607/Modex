const { Sequelize } = require('sequelize');
require('dotenv').config();

// Check if database environment variables are provided
// Support both socket (Hostinger) and host/port (fallback) connections
const hasSocket = !!process.env.DB_SOCKET;
const hasHost = !!process.env.DB_HOST;
const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && (hasSocket || hasHost);

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
    const sequelizeConfig = {
      dialect: 'mysql',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: process.env.NODE_ENV === 'development' ? (msg) => console.log('[sequelize] ' + msg) : false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
    };

    // Use socket path if available (Hostinger), otherwise fallback to host/port
    if (hasSocket) {
      sequelizeConfig.socketPath = process.env.DB_SOCKET;
      console.log('📡 Database configured to use socket connection:', process.env.DB_SOCKET);
    } else if (hasHost) {
      sequelizeConfig.host = process.env.DB_HOST;
      sequelizeConfig.port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
      console.log('🌐 Database configured to use TCP connection:', process.env.DB_HOST + ':' + (sequelizeConfig.port || 3306));
    }

    sequelize = new Sequelize(sequelizeConfig);
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
