const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
// 封装网页代理函数
async function ProxyHtml(url, res) {

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203'
    };

    try {
        // 使用 axios 获取图片并将其作为流传输到客户端
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data); //载入页面
        const results =  $('.category-page.video-list-item.col-xl-3.col-sm-6.col-12').map(function() {
		const item = $(this);
                imgSrc = item.find('img.card-img-top.embed-responsive-item').attr('data-src');          
    		return {
        		imgurl: "/pics/" + Buffer.from(imgSrc.replace('https://pics.vpdmm.cc','https://pics.dmm.co.jp')).toString('base64'),
                        code: item.find('h5.card-title').text().trim(),
			title: item.find('p.card-text').text().trim(),
			date: item.find('span.text-muted').text().trim(),
			href: "/detail/" + code;
    		};
	}).get();

        res.json({ message: results });
    } catch (error) {
        console.error(`下载网页 ${url} 失败:`, error);
        res.status(500).send('下载网页失败');
    }
}

// 网页代理路由，使用 /htmls/:url
router.get(/^\/rank(.*)/, async (req, res) => {    
    const htmlUrl = "https://javmenu.com/zh" + req.path; // 获取 URL 参数
    // 调用网页代理函数
    ProxyHtml(htmlUrl, res);
});

module.exports = router;

// curl -X POST -H "Content-Type: application/json" -d "{\"code\":\"IPX-777\",\"type\":\"info\"}" http://154.40.32.177:3333/api
