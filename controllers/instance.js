const axios = require('axios');
const config = require('../config/config');
const tunnel = require('tunnel');
const https = require('https');

const headers = {
  'User-Agent': config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203',
};

let instance; // 声明 instance 变量

// 定义一个函数来生成代理配置
const createProxy = (https) => {
  if (config.proxy.isUse) {
    const tunnelMethod = https ? 'httpsOver' : 'httpOver';
    const proxyType = config.proxy.type.toLowerCase();
    const proxyConfig = {
      host: config.proxy.host,
      port: config.proxy.port,
    };

    // 根据代理类型生成对应的代理配置
    switch (proxyType) {
      case 'http':
      case 'https':
      case 'socks':
        return tunnel[`${tunnelMethod}${proxyType.charAt(0).toUpperCase() + proxyType.slice(1)}`]({
          proxy: proxyConfig,
          rejectUnauthorized: config.tlsverify || false, // 根据配置决定是否验证 SSL
        });
      default:
        console.error('不支持的代理类型');
        config.proxy.isUse = false; // 禁用代理
        break;
    }
  }
  return null; // 没有代理
};

// 创建代理配置
const proxyHttpsAgent = createProxy(true); // HTTPS 代理
const proxyHttpAgent = createProxy(false); // HTTP 代理

// 创建 axios 实例并应用代理配置
if (proxyHttpsAgent || proxyHttpAgent) {
  instance = axios.create({
    httpsAgent: proxyHttpsAgent, // 使用代理配置
    httpAgent: proxyHttpAgent, // 使用代理配置
    headers: headers,
  });
} else {
  instance = axios.create({
    headers: headers, // 无代理
    httpsAgent: new https.Agent({  
        rejectUnauthorized: config.tlsverify || false
    })
  });
}

module.exports = instance;
