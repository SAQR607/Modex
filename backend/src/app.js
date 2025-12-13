import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (optional - won't crash if .env doesn't exist)
try {
  const dotenv = await import('dotenv');
  dotenv.default.config();
} catch (error) {
  // .env file is optional - continue without it
  console.log('Note: .env file not found. Using environment variables or defaults.');
}

// Process-level error handlers for deployment safety
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit - allow server to continue running
  // In production, you might want to log to external service
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - allow server to continue running
});

const sequelize = (await import('./config/database.js')).default;
const seedAdmin = (await import('./seeders/adminSeeder.js')).default;
const setupChatSocket = (await import('./sockets/chatSocket.js')).default;
const setupWebRTC = (await import('./webrtc/webrtcHandler.js')).default;

// Import routes
const authRoutes = (await import('./routes/authRoutes.js')).default;
const competitionRoutes = (await import('./routes/competitionRoutes.js')).default;
const qualificationRoutes = (await import('./routes/qualificationRoutes.js')).default;
const teamRoutes = (await import('./routes/teamRoutes.js')).default;
const stageRoutes = (await import('./routes/stageRoutes.js')).default;
const submissionRoutes = (await import('./routes/submissionRoutes.js')).default;
const judgeRoutes = (await import('./routes/judgeRoutes.js')).default;
const announcementRoutes = (await import('./routes/announcementRoutes.js')).default;

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

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

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

// Catch-all handler: send back React's index.html file for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.io setup
setupChatSocket(io);
setupWebRTC(io);

// Database sync and admin seeder
const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  
  // Start server even if database is not available (for deployment scenario)
  server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log('='.repeat(50));
  });

  // Attempt database connection (non-blocking)
  // This will not crash the server if database is unavailable
  const initializeDatabase = async () => {
    // Check if database credentials are provided
    const hasDbConfig = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;
    
    if (!hasDbConfig) {
      console.log('\n⚠️  Database configuration not found. Server running without database.');
      console.log('   Set DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST in .env to enable database features.');
      console.log('   Server will continue running. Configure database and restart to enable full functionality.\n');
      return;
    }

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

export { app, server, io };
