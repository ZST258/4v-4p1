const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const instance = require('../controllers/instance');
async function getSearchResult(url, res) {

  try {
    const response = await instance.get(url);
    const $ = cheerio.load(response.data);

    const result = {
      title: "",
      results: []
    };
    
    result.title = $('h2').text().trim();

    const normalItem = $('.category-page.video-list-item.col-xl-3.col-sm-6.col-6.mb-2.px-0.px-md-1');

    //调用promise.all()同时处理抓取的元素
    result.results = await Promise.all(
      normalItem.map( async function() {
        const item = $(this);
        const code = item.find('h5.card-title').text();
        const title = item.find('p.card-text').text().trim();
        const date = item.find('span.text-muted').text();
        const imgSrc = item.find('.embed-responsive-item').attr('data-src');
    
        // 替换图片域名
        const imgSrcReplaced = imgSrc.replace('https://pics.vpdmm.cc', 'https://pics.dmm.co.jp');
    
        const href = "/detail/" + code;
    
        return {
            title: title,
            date: date,
            code: code,
            imgurl: "/pics/" + Buffer.from(imgSrcReplaced).toString('base64'),
            href: href,
            exact: 0
        };
      })
    );
    const extraItem = $('.exact-match');

    if(extraItem.length > 0) {
      const extraCode = extraItem.find('h5').text();
      const extraImgSrc = extraItem.find('.card-img-top').attr('data-src').replace('https://pics.vpdmm.cc','https://pics.dmm.co.jp');
      const extraResult = {
        title: extraItem.find('p').text().trim(),
        date: extraItem.find('.text-muted').text(),
        code: extraCode,
        imgurl: "/pics/" + Buffer.from(extraImgSrc).toString('base64'),
        href: "/detail/" + extraCode,
        exact: 1
      };
      result.results.unshift(extraResult);
    }
    
    
     res.json({ message: result });
  } catch (error) {
     console.error(`下载网页 ${url} 失败:`, error);
     res.status(500).send('下载网页失败');
  }
}

router.get('/search', async (req, res) => {
  const searchKeyword = req.query.wd;
  const page = req.query.page;
  const url = "https://javmenu.com/zh/search?wd=" + searchKeyword + "&page=" + page;
  getSearchResult(url, res);
  
});

module.exports = router;