/**
 * WebRTC handler for team video/audio rooms
 * 
 * IMPORTANT LIMITATIONS:
 * - This implementation uses peer-to-peer (P2P) connections ONLY
 * - NO TURN server is included or configured
 * - Users behind strict NAT/firewalls may experience connection failures
 * - Works best when all participants are on the same network or have public IPs
 * 
 * NAT/FIREWALL ISSUES:
 * - Users behind corporate firewalls may not be able to connect
 * - Users on different networks with symmetric NAT may fail to connect
 * - Mobile networks often use carrier-grade NAT which can block connections
 * 
 * PRODUCTION RECOMMENDATIONS:
 * - Implement a TURN server (e.g., coturn, Twilio, AWS Kinesis Video Streams)
 * - Use STUN server for NAT traversal (free options available)
 * - Consider using WebRTC-as-a-Service solutions for production
 * 
 * CURRENT SCOPE:
 * - Signaling only (offer/answer/ICE candidate exchange via Socket.io)
 * - Team rooms only (one room per team, max 5 users)
 * - No external APIs or services required
 */

const setupWebRTC = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { User } = require('../models');
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      if (!user.teamId) {
        return next(new Error('User must be in a team to use WebRTC'));
      }

      socket.userId = user.id;
      socket.teamId = user.teamId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.of('/webrtc').on('connection', (socket) => {
    const roomId = `team-${socket.teamId}`;
    socket.join(roomId);

    console.log(`User ${socket.userId} joined WebRTC room ${roomId}`);

    // Send existing peers
    socket.to(roomId).emit('peer-joined', { peerId: socket.id });

    // Handle WebRTC signaling
    socket.on('offer', (data) => {
      socket.to(roomId).emit('offer', {
        offer: data.offer,
        from: socket.id
      });
    });

    socket.on('answer', (data) => {
      socket.to(data.to).emit('answer', {
        answer: data.answer,
        from: socket.id
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.to).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('peer-left', { peerId: socket.id });
      console.log(`User ${socket.userId} left WebRTC room ${roomId}`);
    });
  });
};

module.exports = setupWebRTC;

