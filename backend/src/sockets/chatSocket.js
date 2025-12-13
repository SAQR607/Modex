const { User, Team } = require('../models');

const setupChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      socket.teamId = user.teamId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Global chat room
  const globalRoom = 'global-chat';

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join global chat
    socket.join(globalRoom);

    // Join team room if user is in a team
    if (socket.teamId) {
      socket.join(`team-${socket.teamId}`);
    }

    // Global chat message
    socket.on('global-message', async (data) => {
      try {
        const user = await User.findByPk(socket.userId, {
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        });

        io.to(globalRoom).emit('global-message', {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          message: data.message,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Team chat message
    socket.on('team-message', async (data) => {
      try {
        if (!socket.teamId) {
          return socket.emit('error', { message: 'You are not in a team' });
        }

        const user = await User.findByPk(socket.userId, {
          attributes: ['id', 'email', 'firstName', 'lastName', 'role']
        });

        io.to(`team-${socket.teamId}`).emit('team-message', {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          message: data.message,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Team file upload notification
    socket.on('team-file-upload', async (data) => {
      try {
        if (!socket.teamId) {
          return socket.emit('error', { message: 'You are not in a team' });
        }

        const user = await User.findByPk(socket.userId, {
          attributes: ['id', 'email', 'firstName', 'lastName']
        });

        io.to(`team-${socket.teamId}`).emit('team-file-upload', {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fileName: data.fileName,
          filePath: data.filePath,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to notify file upload' });
      }
    });

    // Handle team changes
    socket.on('team-updated', async () => {
      if (socket.teamId) {
        socket.leave(`team-${socket.teamId}`);
      }
      const user = await User.findByPk(socket.userId);
      if (user && user.teamId) {
        socket.teamId = user.teamId;
        socket.join(`team-${socket.teamId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports = setupChatSocket;

