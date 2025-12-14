// Load environment variables FIRST - before anything else
require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env' });

// ENV CHECK - Log environment variable status
console.log('ENV CHECK:', {
  NODE_ENV: process.env.NODE_ENV || 'not set',
  DB_NAME: !!process.env.DB_NAME,
  DB_USER: !!process.env.DB_USER,
  DB_SOCKET: !!process.env.DB_SOCKET,
  DB_HOST: !!process.env.DB_HOST,
  JWT_SECRET: !!process.env.JWT_SECRET,
  PORT: process.env.PORT || 'not set (will use 3000)'
});

// Safe defaults for critical environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set, using temporary default - CHANGE IN PRODUCTION');
  process.env.JWT_SECRET = 'TEMP_DEV_SECRET_CHANGE_ME';
}
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '7d';
}
if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = '*';
  console.warn('⚠️ FRONTEND_URL not set, allowing all origins');
}

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
    origin: process.env.FRONTEND_URL,
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

// API health check with database status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  const hasSocket = !!process.env.DB_SOCKET;
  const hasHost = !!process.env.DB_HOST;
  const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && (hasSocket || hasHost);
  
  if (hasDbConfig) {
    try {
      await sequelize.authenticate();
      dbStatus = hasSocket ? 'connected via socket' : 'connected via TCP';
    } catch (err) {
      dbStatus = 'disconnected';
    }
  }
  
  res.json({
    server: 'ok',
    database: dbStatus,
    env: {
      JWT_SECRET: !!process.env.JWT_SECRET,
      DB_NAME: !!process.env.DB_NAME,
      DB_USER: !!process.env.DB_USER,
      DB_SOCKET: !!process.env.DB_SOCKET,
      DB_HOST: !!process.env.DB_HOST
    }
  });
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

// ============================================
// Multer Error Handler (for file upload errors)
// ============================================
app.use((err, req, res, next) => {
  // Handle multer-specific errors
  if (err instanceof require('multer').MulterError) {
    console.error('===========================================');
    console.error('MULTER UPLOAD ERROR');
    console.error('===========================================');
    console.error('Error Code:', err.code);
    console.error('Error Field:', err.field);
    console.error('Error Message:', err.message);
    console.error('===========================================');
    
    return res.status(400).json({
      status: 'error',
      message: `File upload error: ${err.message}`,
      code: err.code
    });
  }
  
  // Pass to global error handler
  next(err);
});

// ============================================
// Global Error Handling Middleware
// THIS MUST BE THE LAST MIDDLEWARE - after all routes
// ============================================
app.use((err, req, res, next) => {
  // Set default error status code and status
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the complete error with full details
  console.error('===========================================');
  console.error('UNHANDLED ERROR DETECTED');
  console.error('===========================================');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Request Method:', req.method);
  console.error('Request URL:', req.originalUrl || req.url);
  console.error('Request Path:', req.path);
  console.error('Request Body:', JSON.stringify(req.body, null, 2));
  console.error('Request Query:', JSON.stringify(req.query, null, 2));
  console.error('Request Params:', JSON.stringify(req.params, null, 2));
  console.error('Error Status Code:', err.statusCode);
  console.error('Error Status:', err.status);
  console.error('Error Message:', err.message);
  console.error('Error Name:', err.name);
  console.error('Error Stack Trace:');
  console.error(err.stack);
  console.error('Full Error Object:');
  console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  console.error('===========================================');

  // Send error response to client
  // In production, don't expose stack traces to clients
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'An internal server error occurred. Please check the server logs.',
    ...(isDevelopment && {
      stack: err.stack,
      error: err
    })
  });
});

// Socket.io setup - optional
let io;
try {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
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
  
  // Attempt database connection (non-blocking) - NO SYNC, tables already exist
  const hasSocket = !!process.env.DB_SOCKET;
  const hasHost = !!process.env.DB_HOST;
  const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && (hasSocket || hasHost);
  
  if (hasDbConfig) {
    console.log('🔍 Attempting database connection...');
    const connectionType = hasSocket ? 'socket' : 'TCP';
    console.log(`Database connection type: ${connectionType}`);
    console.log('Database config check:', {
      DB_SOCKET: !!process.env.DB_SOCKET,
      DB_HOST: !!process.env.DB_HOST,
      DB_NAME: !!process.env.DB_NAME,
      DB_USER: !!process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD
    });
    
    try {
      await sequelize.authenticate();
      if (hasSocket) {
        console.log('✅ Database connected via socket');
      } else {
        console.log('✅ Database connected via TCP');
      }
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      console.error('Database config status:', {
        DB_SOCKET: !!process.env.DB_SOCKET,
        DB_HOST: !!process.env.DB_HOST,
        DB_NAME: !!process.env.DB_NAME,
        DB_USER: !!process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD
      });
      console.warn('⚠️ Database disconnected - running in degraded mode');
      // Do NOT exit - server continues without database
    }
  } else {
    console.warn('⚠️ Database credentials loaded from environment at runtime.');
    console.log('Database config status:', {
      DB_SOCKET: !!process.env.DB_SOCKET,
      DB_HOST: !!process.env.DB_HOST,
      DB_NAME: !!process.env.DB_NAME,
      DB_USER: !!process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD
    });
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
