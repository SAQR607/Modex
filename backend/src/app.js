// Load environment variables FIRST - before anything else
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env' });

// ENV CHECK - Log environment variable status
console.log('ENV CHECK:', {
  NODE_ENV: process.env.NODE_ENV || 'not set',
  DB_NAME: !!process.env.DB_NAME,
  DB_USER: !!process.env.DB_USER,
  DB_HOST: !!process.env.DB_HOST,
  JWT_SECRET: !!process.env.JWT_SECRET,
  PORT: process.env.PORT || 'not set (will use 3000)'
});

const express = require('express');
const http = require('http');
const path = require('path');

console.log('🔥 ENTRY FILE EXECUTED: backend/src/app.js');

// Process-level error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ FATAL UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ FATAL UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

console.log('🔥 SEQUELIZE INIT START');

// Import DB and models - database is optional
const sequelize = require('./config/database');
const models = require('./models/index'); // This loads all models and defines relationships

console.log('🔥 MODELS LOADED:');
console.log('   MODEL LOADED: User');
console.log('   MODEL LOADED: Competition');
console.log('   MODEL LOADED: Stage');
console.log('   MODEL LOADED: Team');
console.log('   MODEL LOADED: TeamMember');
console.log('   MODEL LOADED: QualificationQuestion');
console.log('   MODEL LOADED: QualificationAnswer');
console.log('   MODEL LOADED: Judge');
console.log('   MODEL LOADED: Score');
console.log('   MODEL LOADED: UploadedFile');

// Initialize Express app
const app = express();
const server = http.createServer(app);

console.log('Express initialized');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
try {
  const cors = require('cors');
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }));
} catch (error) {
  console.warn('CORS module failed to load, continuing without CORS middleware');
}

// Serve uploaded files
try {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
} catch (error) {
  console.warn('Uploads directory not available');
}

// Serve static files from public folder
try {
  app.use(express.static(path.join(__dirname, '../public')));
} catch (error) {
  console.warn('Public directory not available');
}

// Minimal health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Modex Platform API is running' });
});

// Load routes - FORCE registration without try-catch to see errors
console.log('Loading routes...');

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered at /api/auth');

const competitionRoutes = require('./routes/competitionRoutes');
app.use('/api/competitions', competitionRoutes);
console.log('✅ Competition routes registered');

const qualificationRoutes = require('./routes/qualificationRoutes');
app.use('/api/qualifications', qualificationRoutes);
console.log('✅ Qualification routes registered');

const teamRoutes = require('./routes/teamRoutes');
app.use('/api/teams', teamRoutes);
console.log('✅ Team routes registered');

const stageRoutes = require('./routes/stageRoutes');
app.use('/api/stages', stageRoutes);
console.log('✅ Stage routes registered');

const submissionRoutes = require('./routes/submissionRoutes');
app.use('/api/submissions', submissionRoutes);
console.log('✅ Submission routes registered');

const judgeRoutes = require('./routes/judgeRoutes');
app.use('/api/judges', judgeRoutes);
console.log('✅ Judge routes registered');

const announcementRoutes = require('./routes/announcementRoutes');
app.use('/api/announcements', announcementRoutes);
console.log('✅ Announcement routes registered');

// Catch-all handler
try {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
} catch (error) {
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// Global error handling middleware - MUST be after all routes
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  console.error('Error stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Socket.io setup - optional
let io;
try {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  try {
    const setupChatSocket = require('./sockets/chatSocket');
    setupChatSocket(io);
  } catch (error) {
    console.warn('Chat socket setup failed:', error.message);
  }

  try {
    const setupWebRTC = require('./webrtc/webrtcHandler');
    setupWebRTC(io);
  } catch (error) {
    console.warn('WebRTC setup failed:', error.message);
  }
} catch (error) {
  console.warn('Socket.io failed to initialize:', error.message);
  io = null;
}

// Start server - database is optional and non-blocking
const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  
  // Attempt database connection (non-blocking)
  const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;
  
  if (hasDbConfig) {
    try {
      console.log('🔥 DB AUTH START');
      await sequelize.authenticate();
      console.log('🔥 DB AUTH OK');

      console.log('🔥 DB SYNC START - Running sequelize.sync({ alter: true })');
      await sequelize.sync({ force: false, alter: true });
      console.log('🔥 DB SYNC DONE - TABLES SHOULD EXIST');
      
      // Verify tables exist by querying
      try {
        const [results] = await sequelize.query("SHOW TABLES");
        console.log('🔥 VERIFICATION: Found', results.length, 'tables in database');
        results.forEach(row => {
          const tableName = Object.values(row)[0];
          console.log('   - Table:', tableName);
        });
      } catch (queryError) {
        console.warn('Could not verify tables:', queryError.message);
      }
    } catch (err) {
      console.error('⚠ Database connection failed:', err.message);
      console.error('Server will continue without database functionality.');
      // Do NOT exit - server continues without database
    }
  } else {
    console.log('⚠ Database disabled – missing environment variables');
    console.log('Server running without database functionality.');
  }

  // Start server - ALWAYS succeeds regardless of database status
  try {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('✅ Server started successfully');
    });
  } catch (error) {
    console.error('❌ FATAL: Server failed to start:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
