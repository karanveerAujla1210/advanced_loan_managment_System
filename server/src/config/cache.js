/**
 * Redis Cache Configuration
 * Future-ready caching layer for high-performance CRM
 */

const redis = require('redis');
const logger = require('./logger');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (process.env.REDIS_URL) {
        this.client = redis.createClient({
          url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => {
          logger.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          logger.info('Redis connected successfully');
          this.isConnected = true;
        });

        await this.client.connect();
      } else {
        logger.info('Redis not configured - using memory cache fallback');
        this.memoryCache = new Map();
      }
    } catch (error) {
      logger.error('Redis connection failed:', error);
      this.memoryCache = new Map();
    }
  }

  async get(key) {
    try {
      if (this.client && this.isConnected) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else if (this.memoryCache) {
        return this.memoryCache.get(key) || null;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (this.client && this.isConnected) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
      } else if (this.memoryCache) {
        this.memoryCache.set(key, value);
        // Simple TTL for memory cache
        setTimeout(() => {
          this.memoryCache.delete(key);
        }, ttl * 1000);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async del(key) {
    try {
      if (this.client && this.isConnected) {
        await this.client.del(key);
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async flush() {
    try {
      if (this.client && this.isConnected) {
        await this.client.flushAll();
      } else if (this.memoryCache) {
        this.memoryCache.clear();
      }
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }
}

module.exports = new CacheManager();