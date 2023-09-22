const axios = require('axios');
const config = require('../config/config');
const https = require('https'); // 你需要导入 https 模块

const headers = {
  'User-Agent': config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203',
};

let instance; // 声明 instance 变量

if (config.proxy.isUse) {
  instance = axios.create({
    proxy: {
      host: config.proxy.host,
      port: config.proxy.port,
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: config.tlsverify || false,
    }),
    headers: headers, // 请求头设置在这里
  });
} else {
  instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: config.tlsverify || false,
    }),
    headers: headers, // 请求头设置在这里
  });
}

module.exports = instance;