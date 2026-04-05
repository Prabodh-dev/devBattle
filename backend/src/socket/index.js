const User = require('../models/User');
const Message = require('../models/Message');
const { verifyToken } = require('../middleware/auth');
const { redisUtils } = require('../config/redis');
const logger = require('../utils/logger');
const initializeSocketIO = (io) => {
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
  io.on('connection', async (socket) => {
    logger.info(`User connected: ${socket.userId}`);
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });
    await redisUtils.setUserOnline(socket.userId, socket.id);
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      username: socket.user.username,
    });
    socket.join(`user:${socket.userId}`);
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
        if (recipientId) {
          io.to(`user:${recipientId}`).emit('message:receive', populatedMessage);
        } else if (groupId) {
          io.to(`group:${groupId}`).emit('message:receive', populatedMessage);
        }
        socket.emit('message:sent', populatedMessage);
      } catch (error) {
        logger.error(`Message send error: ${error.message}`);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });
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
    socket.on('battle:join', (data) => {
      const { battleId } = data;
      socket.join(`battle:${battleId}`);
      logger.info(`User ${socket.userId} joined battle ${battleId}`);
    });
    socket.on('battle:leave', (data) => {
      const { battleId } = data;
      socket.leave(`battle:${battleId}`);
    });
    socket.on('battle:submission', (data) => {
      const { battleId, status } = data;
      socket.to(`battle:${battleId}`).emit('battle:opponent-submitted', {
        userId: socket.userId,
        status,
      });
    });
    socket.on('contest:join', (data) => {
      const { contestId } = data;
      socket.join(`contest:${contestId}`);
      logger.info(`User ${socket.userId} joined contest ${contestId}`);
    });
    socket.on('contest:leave', (data) => {
      const { contestId } = data;
      socket.leave(`contest:${contestId}`);
    });
    socket.on('group:join', (data) => {
      const { groupId } = data;
      socket.join(`group:${groupId}`);
    });
    socket.on('group:leave', (data) => {
      const { groupId } = data;
      socket.leave(`group:${groupId}`);
    });
    socket.on('status:update', async (data) => {
      const { status } = data;
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status,
      });
    });
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${socket.userId}`);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      });
      await redisUtils.setUserOffline(socket.userId);
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        lastSeen: new Date(),
      });
    });
  });
  return io;
};
module.exports = { initializeSocketIO };
