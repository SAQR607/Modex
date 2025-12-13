const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const seedAdmin = require('./seeders/adminSeeder');
const setupChatSocket = require('./sockets/chatSocket');
const setupWebRTC = require('./webrtc/webrtcHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const qualificationRoutes = require('./routes/qualificationRoutes');
const teamRoutes = require('./routes/teamRoutes');
const stageRoutes = require('./routes/stageRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const judgeRoutes = require('./routes/judgeRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Modex Platform API is running' });
});

// Socket.io setup
setupChatSocket(io);
setupWebRTC(io);

// Database sync and admin seeder
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  // Start server even if database is not available (for deployment scenario)
  server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
    console.log('='.repeat(50));
  });

  // Attempt database connection (non-blocking)
  const initializeDatabase = async () => {
    try {
      console.log('\nAttempting to connect to database...');
      await sequelize.authenticate();
      console.log('✓ Database connection established.');

      // Sync database (creates tables if they don't exist)
      // NOTE: This assumes the database already exists (created manually by user)
      console.log('Synchronizing database schema...');
      await sequelize.sync({ alter: false });
      console.log('✓ Database synchronized.');

      // Seed admin user
      console.log('Checking admin user...');
      await seedAdmin();
      console.log('✓ Database initialization complete.\n');
    } catch (error) {
      console.error('\n⚠️  Database connection failed. Server is running but database features are unavailable.');
      console.error('Error:', error.message);
      
      if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeAccessDeniedError') {
        console.error('\n📋 Waiting for database configuration after deployment.');
        console.error('Please ensure:');
        console.error('1. MySQL database is created in hosting panel');
        console.error('2. Database credentials are set in .env file');
        console.error('3. Database user has proper permissions');
        console.error('4. Restart the server after database is configured\n');
      } else if (error.name === 'SequelizeDatabaseError' && error.message.includes("Unknown database")) {
        console.error('\n📋 Database does not exist yet.');
        console.error('Please create the database in your hosting panel, then restart the server.\n');
      } else {
        console.error('\nPlease check your database configuration and restart the server.\n');
      }
      
      // Server continues running - database can be configured later
      console.log('Server will continue running. Configure database and restart to enable full functionality.\n');
    }
  };

  // Initialize database asynchronously (non-blocking)
  initializeDatabase();
};

startServer();

module.exports = { app, server, io };

