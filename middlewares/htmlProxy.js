const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
// 提取网站javbus信息的函数
function extractJavbusInfo(data) {
    const $ = cheerio.load(data);
    const result = {
        title: "",
        results: []
    };
    result.title = $('div.container-fluid > div > div.alert.alert-success.alert-common > p > b:nth-child(1)').text()
        .replace(' - 有碼類別', ' - 标签').replace('製作商', '制作商')
        .replace('導演', '导演').replace('發行商', '发行商');
    result.results = $('#waterfall .item').find('a').map(function () {
        const text = $(this).find('div.photo-info span date').text().trim();
        const dateRegex = /(\d{4}-\d{2}-\d{2})/;
        const dateMatch = text.match(dateRegex);
        const imgTitle = $(this).find('img').attr('title');
        const date = dateMatch ? dateMatch[0] : '';
        const code = text.replace(date, '').trim();
        let imgSrc = $(this).find('img').attr('src');

        if (!imgSrc.startsWith("https://") && !imgSrc.startsWith("http://")) {
            imgSrc = "https://www.javbus.com" + imgSrc;
        }

        imgSrc = "/pics/" + Buffer.from(imgSrc).toString('base64');

        const href = $(this).attr('href').replace('https://www.javbus.com/', '/detail/');

        return {
            title: imgTitle,
            date: date,
            code: code,
            imgurl: imgSrc,
            href: href
        };
    }).get();

    return result;
}

// 提取网站javmenu信息的函数
function extractJavmenuInfo(data) {
    const $ = cheerio.load(data);
    const result = {
        title: "",
        results: []
    };
    result.title = $('h2.text-center.font-weight-bold.my-4').text().trim();
    const resultHtml = $('.category-page.video-list-item.col-xl-3.col-sm-6.col-6.mb-2.px-0.px-md-1');
    result.results = resultHtml.map(function () {
        const item = $(this);
        const code = item.find('h5.card-title').text();
        const imgTitle = item.find('p.card-text').text().trim();
        const date = item.find('span.text-muted').text();
        const imgSrc = item.find('.embed-responsive-66').find('.embed-responsive-item').attr('data-src');
    
        // 替换图片域名
        const imgSrcReplaced = imgSrc.replace('https://pics.vpdmm.cc', 'https://pics.dmm.co.jp');

        return {
            title: imgTitle,
            date: date,
            code: code,
            imgurl: "/pics/" + Buffer.from(imgSrcReplaced).toString('base64'),
            href: "/detail/" + code
        };
    }).get();

    return result;
}

// 封装网页代理函数
async function ProxyHtml(url, res) {
    const axios = require('axios');

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203'
    };

    try {
        const response = await axios.get(url, { headers });
        const result = extractJavbusInfo(response.data);
        res.json({ message: result });
    } catch (error) {
      try {
        url = url.replace('https://www.javbus.com/','https://javmenu.com/zh/')
        const response = await axios.get(url, { headers });
        const result = extractJavmenuInfo(response.data);
        res.json({ message: result });
      } catch (serror) {
        res.status(500).send('下载网页失败');
      }
    }
}

// 网页代理路由，使用 /htmls/:url
router.get(/^\/htmls(.*)/, async (req, res) => {    
    const htmlUrl = "https://www.javbus.com/" + req.path.replace('/htmls/',''); // 获取 URL 参数
    // 调用网页代理函数
    await ProxyHtml(htmlUrl, res);
});

module.exports = router;

// curl -X POST -H "Content-Type: application/json" -d "{\"code\":\"IPX-777\",\"type\":\"info\"}" http://154.40.32.177:3333/api