const User = require('../models/User');
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');
const { redisUtils } = require('../config/redis');
const logger = require('../utils/logger');

const initializeSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Update user status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Set user online in Redis
    await redisUtils.setUserOnline(socket.userId, socket.id);

    // Broadcast user online status to friends
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      username: socket.user.username,
    });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // ========== MESSAGING EVENTS ==========

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, recipientId, groupId, content, messageType, codeSnippet } = data;

        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          recipient: recipientId || null,
          group: groupId || null,
          content,
          messageType: messageType || 'text',
          codeSnippet: codeSnippet || null,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'username profilePicture'
        );

        // Emit to recipient or group
        if (recipientId) {
          io.to(`user:${recipientId}`).emit('message:receive', populatedMessage);
        } else if (groupId) {
          io.to(`group:${groupId}`).emit('message:receive', populatedMessage);
        }

        // Confirm to sender
        socket.emit('message:sent', populatedMessage);
      } catch (error) {
        logger.error(`Message send error: ${error.message}`);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', async (data) => {
      const { conversationId, recipientId } = data;
      await redisUtils.setTyping(conversationId, socket.userId);
      
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('typing:indicator', {
          conversationId,
          userId: socket.userId,
          username: socket.user.username,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', async (data) => {
      const { conversationId, recipientId } = data;
      await redisUtils.removeTyping(conversationId, socket.userId);
      
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('typing:indicator', {
          conversationId,
          userId: socket.userId,
          isTyping: false,
        });
      }
    });

    // Message read receipt
    socket.on('message:read', async (data) => {
      try {
        const { messageId, senderId } = data;

        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              user: socket.userId,
              readAt: new Date(),
            },
          },
        });

        io.to(`user:${senderId}`).emit('message:read-receipt', {
          messageId,
          readBy: socket.userId,
          readAt: new Date(),
        });
      } catch (error) {
        logger.error(`Read receipt error: ${error.message}`);
      }
    });

    // ========== BATTLE EVENTS ==========

    // Join battle room
    socket.on('battle:join', (data) => {
      const { battleId } = data;
      socket.join(`battle:${battleId}`);
      logger.info(`User ${socket.userId} joined battle ${battleId}`);
    });

    // Leave battle room
    socket.on('battle:leave', (data) => {
      const { battleId } = data;
      socket.leave(`battle:${battleId}`);
    });

    // Battle submission update
    socket.on('battle:submission', (data) => {
      const { battleId, status } = data;
      socket.to(`battle:${battleId}`).emit('battle:opponent-submitted', {
        userId: socket.userId,
        status,
      });
    });

    // ========== CONTEST EVENTS ==========

    // Join contest room
    socket.on('contest:join', (data) => {
      const { contestId } = data;
      socket.join(`contest:${contestId}`);
      logger.info(`User ${socket.userId} joined contest ${contestId}`);
    });

    // Leave contest room
    socket.on('contest:leave', (data) => {
      const { contestId } = data;
      socket.leave(`contest:${contestId}`);
    });

    // ========== GROUP EVENTS ==========

    // Join group room
    socket.on('group:join', (data) => {
      const { groupId } = data;
      socket.join(`group:${groupId}`);
    });

    // Leave group room
    socket.on('group:leave', (data) => {
      const { groupId } = data;
      socket.leave(`group:${groupId}`);
    });

    // ========== PRESENCE EVENTS ==========

    // User status update
    socket.on('status:update', async (data) => {
      const { status } = data;
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status,
      });
    });

    // ========== DISCONNECTION ==========

    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${socket.userId}`);

      // Update user status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });

      // Set user offline in Redis
      await redisUtils.setUserOffline(socket.userId);

      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    });
  });

  return io;
};

module.exports = { initializeSocketIO };
