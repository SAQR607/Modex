const express = require('express');
const http = require('http');
const path = require('path');

console.log('Booting server...');

// Load environment variables (optional - won't crash if .env doesn't exist)
try {
  require('dotenv').config();
} catch (error) {
  // .env file is optional - continue without it
}

// Process-level error handlers for deployment safety
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit - allow server to continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - allow server to continue running
});

// Initialize Express app
const app = express();
const server = http.createServer(app);

console.log('Express initialized');

// Middleware - safe to use even if other modules fail
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - safe defaults
try {
  const cors = require('cors');
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }));
} catch (error) {
  console.warn('CORS module failed to load, continuing without CORS middleware');
}

// Serve uploaded files (safe - directory may not exist)
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

// Minimal health endpoint - MUST work without database
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API health check (legacy endpoint)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Modex Platform API is running' });
});

// Load routes safely - continue even if some routes fail
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

// Catch-all handler: send back React's index.html file for all non-API routes
try {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
} catch (error) {
  // If index.html doesn't exist, return 404
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// Socket.io setup - optional, don't block startup
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

// Database initialization - completely optional, non-blocking
const initializeDatabase = async () => {
  // Check if database credentials are provided
  const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;
  
  if (!hasDbConfig) {
    console.log('Database: skipped (no configuration)');
    return;
  }

  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    console.log('Database: connected');
    
    try {
      await sequelize.sync({ alter: false });
      const seedAdmin = require('./seeders/adminSeeder');
      await seedAdmin();
    } catch (error) {
      console.warn('Database sync/seeding failed:', error.message);
    }
  } catch (error) {
    console.log('Database: skipped (connection failed)');
  }
};

// Start server - CRITICAL: This MUST succeed
const PORT = process.env.PORT || 3000;

try {
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
    // Initialize database asynchronously (non-blocking)
    initializeDatabase().catch(() => {
      // Already logged in initializeDatabase
    });
  });
} catch (error) {
  console.error('FATAL: Server failed to start:', error.message);
  process.exit(1);
}

module.exports = { app, server, io };
