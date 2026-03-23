const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error(`Redis Error: ${err.message}`);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

// Redis utilities
const redisUtils = {
  // User presence
  async setUserOnline(userId, socketId) {
    await redisClient.hset(`user:${userId}`, 'online', 'true', 'socketId', socketId);
    await redisClient.expire(`user:${userId}`, 86400); // 24 hours
  },

  async setUserOffline(userId) {
    await redisClient.hset(`user:${userId}`, 'online', 'false');
    await redisClient.hdel(`user:${userId}`, 'socketId');
  },

  async getUserPresence(userId) {
    const data = await redisClient.hgetall(`user:${userId}`);
    return {
      online: data.online === 'true',
      socketId: data.socketId || null,
    };
  },

  // Typing indicators
  async setTyping(conversationId, userId) {
    await redisClient.sadd(`typing:${conversationId}`, userId);
    await redisClient.expire(`typing:${conversationId}`, 10);
  },

  async removeTyping(conversationId, userId) {
    await redisClient.srem(`typing:${conversationId}`, userId);
  },

  async getTypingUsers(conversationId) {
    return await redisClient.smembers(`typing:${conversationId}`);
  },

  // Caching
  async cache(key, value, ttl = 3600) {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  },

  async getCache(key) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  async deleteCache(key) {
    await redisClient.del(key);
  },

  async deleteCachePattern(pattern) {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },

  // Rate limiting
  async checkRateLimit(key, limit, window) {
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, window);
    }
    return current <= limit;
  },
};

module.exports = redisClient;
module.exports.redisUtils = redisUtils;
