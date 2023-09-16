//redisClient.js

const Redis = require('ioredis');
const bodyParser = require('body-parser');

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
  redisMiddleware,
  getCache,
};
