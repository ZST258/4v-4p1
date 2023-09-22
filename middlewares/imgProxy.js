const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();
const instance = require('../controllers/instance');

// 封装图片代理函数
async function ProxyImgStream(url, res) {
    try {
        // 使用 axios 获取图片并将其作为流传输到客户端
        const response = await instance.get(url, { responseType: 'stream' });

        // 获取 Axios 响应头中的 Content-Type
        const contentType = response.headers['content-type'];

        // 设置响应头，指示响应的内容类型
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        } else {
            // 如果未提供内容类型，默认设置为 image/jpeg
            res.setHeader('Content-Type', 'image/jpeg');
        }

        // 将图片流式传输到响应对象
        response.data.pipe(res);
    } catch (error) {
        console.error(`下载图片 ${url} 失败:`, error);
        res.status(500).send('下载图片失败');
    }
}

// 图片代理路由，使用 /pics/:url
router.get('/pics/:url', async (req, res) => {
    const encodedUrl = req.params.url; // 获取编码后的 URL 参数
    const imageUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8'); // 使用 querystring.unescape 解码 URL 参数

    // 调用图片代理函数
    ProxyImgStream(imageUrl, res);
});

module.exports = router;

// curl -X POST -H "Content-Type: application/json" -d "{\"code\":\"IPX-777\",\"type\":\"info\"}" http://154.40.32.177:3333/api