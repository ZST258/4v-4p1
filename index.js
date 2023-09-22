const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // 引入 axios
const cheerio = require('cheerio'); // 引入 cheerio
const https = require('https');
const Redis = require('ioredis');
const path = require('path');
const config = require('./config/config');
const instance = require('./controllers/instance');

// 引入连接池模块
const { createRedisPool, redisMiddleware, getCache } = require('./middlewares/redisClient');

let redisPool = null; // 声明一个全局的redisPool变量

(async () => { //必须等待promise返回
  redisPool = await createRedisPool();
  if (!redisPool) {
    console.error('Redis未连接');
  }
})();

const webRouter = require('./middlewares/webRouter'); // 导入 webRouter.js
const imgProxyRouter = require('./middlewares/imgProxy');
const htmlProxyRouter = require('./middlewares/htmlProxy');
const searchRouter = require('./middlewares/search');
const rankRouter = require('./middlewares/rank');

const app = express();
const port = config.port || 3333;

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  //添加Cache-Control请求头
  // 设置Cache-Control请求头，max-age表示缓存的最大有效时间（以秒为单位）
  res.setHeader('Cache-Control', 'public, max-age=7200'); // 7200秒等于2小时
  next();
});

// 禁用 x-powered-by 标头
app.disable('x-powered-by');

app.use(bodyParser.json());

// 引入不同的处理逻辑模块
const infoController = require('./controllers/info');
const fc2infoController = require('./controllers/fc2info');
const urlController = require('./controllers/url');
const rateController = require('./controllers/rate');
const magnetController = require('./controllers/magnet');
const preprocessController = require('./controllers/preprocess');

app.post('/api', redisMiddleware(redisPool), async (req, res) => {
    req.body = await preprocessController.PreprocessRequest(req);
    try {
        if (req.redisClient) {
            const cacheValue = await getCache(req.redisClient, req.key);
            if (cacheValue) {
                await req.redisClient.expire(req.key, 300);
                res.json({ message: cacheValue });
                return;
            }
        }
        let responseMessage = '';
        switch (req.body.type) {
            case 'info':
                responseMessage = await infoController.GetInfoMsg(req.body.code,req.body.html,req.body.site);
                break;
            case 'url':
                responseMessage = urlController.GetUrlMsg(req.body.code);
                break;
            case 'rate':
                responseMessage = await rateController.GetRateMsg(req.body.code,req.body.html,req.body.rate);
                break;
            case 'fc2info':
                responseMessage = await fc2infoController.GetInfoMsg(req.body.fc2num);		
                break;
            case 'magnet':
                responseMessage = await magnetController.GetMagnetInfo(req.body.code,req.body.html);		
                break;
            default:
                responseMessage = '请求错误';
        }
        // 存储结果到 Redis 缓存
        if ( responseMessage == '请求错误' || responseMessage == null ) {
            res.status(500).json({ message: responseMessage });
        } else {
            if (req.redisClient) {
                await req.redisClient.set(req.key, JSON.stringify(responseMessage), 'EX', 300);
            }
            res.json({ message: responseMessage });
        }
    } catch (error) {
        // 处理错误
        res.status(500).json({ error: '内部服务器错误' });
    }
});

// 使用图片代理路由
app.use(imgProxyRouter);
app.use(webRouter);
// 使用html网页代理路由
app.use(htmlProxyRouter);
app.use(searchRouter);
app.use(rankRouter);


app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});