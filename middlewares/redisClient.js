//redisClient.js

const Redis = require('ioredis');
const bodyParser = require('body-parser');

const createRedisPool = () => {
  const redisPool = new Redis({
    host: '127.0.0.1',
    port: 6379,
    retryStrategy(){return null},
  });

  // 等待连接建立成功或失败
  return new Promise((resolve, reject) => {
    redisPool.on('connect', () => {
      resolve(redisPool); // 连接成功，返回连接池对象
    });

    redisPool.on('error', (error) => {
      redisPool.disconnect(); // 断开连接
      resolve(null); // 连接失败，返回错误
    });
  });
};

const redisMiddleware = (redisPool) => async (req, res, next) => {
  try {
    // 从连接池中获取连接
    req.redisClient = redisPool;
    next();
  } catch (error) {
    // 处理Redis连接失败的错误
    console.error('Redis连接失败:', error);
    req.redisClient = null; // 将req.redisClient设置为null，表示连接失败
    next(); // 继续路由处理
  }
};

const getCache = async (redisClient, key) => {
  const value = await redisClient.get(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};

module.exports = {
  createRedisPool,
  redisMiddleware,
  getCache,
};
