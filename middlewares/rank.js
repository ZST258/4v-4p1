const express = require('express');
const cheerio = require('cheerio');
const router = express.Router();
const  config = require('../config/config');
const instance = require('../controllers/instance');
// 封装网页代理函数
async function ProxyHtml(url, res, title) {

    try {
        // 使用 instance 获取图片并将其作为流传输到客户端
        const response = await instance.get(url);
        const $ = cheerio.load(response.data); //载入页面
	const result = {
		title: title,
                results: []
	}
        result.results =  $('.category-page.video-list-item.col-xl-3.col-sm-6.col-12').map(function() {
		const item = $(this);
                imgSrc = item.find('img.card-img-top.embed-responsive-item').attr('data-src');  
		const code = item.find('h5.card-title').text().trim();
    		return {
        		imgurl: "/pics/" + Buffer.from(imgSrc.replace('https://pics.vpdmm.cc','https://pics.dmm.co.jp')).toString('base64'),
                        code: code,
			title: item.find('p.card-text').text().trim(),
			date: item.find('span.text-muted').text().trim(),
			href: "/detail/" + code,
			exact: 0
    		};
	}).get();

        res.json({ message: result });
    } catch (error) {
        console.error(`下载网页 ${url} 失败:`, error);
        res.status(500).send('下载网页失败');
    }
}

// 网页代理路由，使用 /htmls/:url
router.get(/^\/rank/, async (req, res) => {
    const page = req.query.page; // 获取查询参数 "page" 的值
       //
    const sort = req.path.split('/')[2];
    const period = req.path.split('/')[3];
    let title=''
    const sortMap = {
        censored: '有码', 
        uncensored: '无码',
        western: '欧美',
        actress: '女优'
    }
    const periodMap = {
        day: '日',
        week: '周',
        month: '月'
    }
    if(sort && period ) {
       title=`云霄${sortMap[sort]}${periodMap[period]}榜`;
    }
    const htmlUrl = config.websiteUrl.javmenu + '/zh' + req.path +'?page=' + page; // 获取 URL 参数     
    // 调用网页代理函数
    ProxyHtml(htmlUrl, res, title);
});

module.exports = router;

// curl -X POST -H "Content-Type: application/json" -d "{\"code\":\"IPX-777\",\"type\":\"info\"}" http://154.40.32.177:3333/api
