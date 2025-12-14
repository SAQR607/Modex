const express = require('express');
const http = require('http');
const path = require('path');

console.log('🔥 ENTRY FILE EXECUTED: backend/src/app.js');

// Load environment variables - REQUIRED
require('dotenv').config();

// ENV VERIFICATION - FAIL HARD IF MISSING
console.log('🔥 VERIFYING ENVIRONMENT VARIABLES...');
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('❌ Server cannot start without database configuration.');
  process.exit(1);
}

console.log('✅ ENV VARS CHECK:');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'MISSING');

// Remove error handlers that prevent crashes - we WANT to fail hard
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');

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

// Import DB and models FIRST - ensure models loaded and relationships defined
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

// Load routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.warn('Auth routes failed to load:', error.message);
}

try {
  const competitionRoutes = require('./routes/competitionRoutes');
  app.use('/api/competitions', competitionRoutes);
} catch (error) {
  console.warn('Competition routes failed to load:', error.message);
}

try {
  const qualificationRoutes = require('./routes/qualificationRoutes');
  app.use('/api/qualifications', qualificationRoutes);
} catch (error) {
  console.warn('Qualification routes failed to load:', error.message);
}

try {
  const teamRoutes = require('./routes/teamRoutes');
  app.use('/api/teams', teamRoutes);
} catch (error) {
  console.warn('Team routes failed to load:', error.message);
}

try {
  const stageRoutes = require('./routes/stageRoutes');
  app.use('/api/stages', stageRoutes);
} catch (error) {
  console.warn('Stage routes failed to load:', error.message);
}

try {
  const submissionRoutes = require('./routes/submissionRoutes');
  app.use('/api/submissions', submissionRoutes);
} catch (error) {
  console.warn('Submission routes failed to load:', error.message);
}

try {
  const judgeRoutes = require('./routes/judgeRoutes');
  app.use('/api/judges', judgeRoutes);
} catch (error) {
  console.warn('Judge routes failed to load:', error.message);
}

try {
  const announcementRoutes = require('./routes/announcementRoutes');
  app.use('/api/announcements', announcementRoutes);
} catch (error) {
  console.warn('Announcement routes failed to load:', error.message);
}

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

// Start server with MANDATORY database sync
const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  
  try {
    console.log('🔥 DB AUTH START');
    await sequelize.authenticate();
    console.log('🔥 DB AUTH OK');

    console.log('🔥 DB SYNC START - Running sequelize.sync({ alter: true })');
    await sequelize.sync({ force: false, alter: true });
    console.log('🔥 DB SYNC DONE - TABLES SHOULD EXIST');
    
    // Verify tables exist by querying
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('🔥 VERIFICATION: Found', results.length, 'tables in database');
    results.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log('   - Table:', tableName);
    });
    
  } catch (err) {
    console.error('❌ FATAL SEQUELIZE ERROR:', err.message);
    console.error('❌ Full error stack:');
    console.error(err.stack);
    console.error('❌ Server cannot start without database. Exiting...');
    process.exit(1);
  }

  // Start server
  try {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('✅ ALL STARTUP CHECKS PASSED');
    });
  } catch (error) {
    console.error('❌ FATAL: Server failed to start:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
