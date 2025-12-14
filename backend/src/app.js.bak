const express = require('express');
const http = require('http');
const path = require('path');

console.log('APP.JS STARTING');

// Load environment variables (optional - won't crash if .env doesn't exist)
require('dotenv').config();

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

// Import DB and models FIRST - ensure models loaded and relationships defined
const sequelize = require('./config/database');
require('./models/index'); // This loads all models and defines relationships

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

// Start server with database sync
const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  
  // Check if database credentials are provided
  const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;
  
  if (hasDbConfig) {
    try {
      console.log('APP.JS: attempting DB authenticate...');
      await sequelize.authenticate();
      console.log('✅ Database connected');

      console.log('APP.JS: running sequelize.sync({ alter: true }) ...');
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced (tables created/updated)');
    } catch (err) {
      console.error('❌ Startup error:', err.message);
      console.error('Stack:', err.stack);
      // Do not exit - log error for hostinger; keep process alive for debugging
    }
  } else {
    console.log('Database: skipped (no configuration)');
  }

  // Start server even if database failed
  try {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('FATAL: Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
