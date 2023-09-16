// controllers/info.js
const axios = require('axios');
const cheerio = require('cheerio');

async function GetInfoMsg(code, html, site) {
    // 创建一个 MovieInfo 对象，将所有属性初始化为空
    const MovieInfo = {
        title: "",
        code: "",
        date: "",
        length: "",
        director: {
            text: "",
            href: ""
        },
        maker: {
            text: "",
            href: ""
        },
        publisher: {
            text: "",
            href: ""
        },
        series: {
            text: "",
            href: ""
        },
        cover: "",
        actress: [],
        genre: [],
        extrafanart: []
    };

    if (site == "javbus") {
        try {
            const $ = cheerio.load(html);

            // 提取网页信息
            // 使用 Cheerio 选择器选择和填充属性
            MovieInfo.title = $('title').text().replace(' - JavBus', ''); // 示例：选择网页标题
            MovieInfo.code = code; // 传入的参数 code
            MovieInfo.date = $('div:nth-of-type(5) p:nth-of-type(2)').text().replace('發行日期: ', '');
            MovieInfo.length = $('div:nth-of-type(5) p:nth-of-type(3)').text().replace('長度: ', '');

            const spanDirector = $('span:contains("導演:")');
            const spanMaker = $('span:contains("製作商:")');
            const spanPublisher = $('span:contains("發行商:")');
            const spanSeries = $('span:contains("系列:")');

            MovieInfo.director.text = spanDirector.next('a').text();
            MovieInfo.director.href = spanDirector.next('a').attr('href');
            MovieInfo.maker.text = spanMaker.next('a').text();
            MovieInfo.maker.href = spanMaker.next('a').attr('href');
            MovieInfo.publisher.text = spanPublisher.next('a').text();
            MovieInfo.publisher.href = spanPublisher.next('a').attr('href');
            MovieInfo.series.text = spanSeries.next('a').text();
            MovieInfo.series.href = spanSeries.next('a').attr('href');

            // 提取演员信息
            const starNameDiv = $('div.star-name').find('a');
            MovieInfo.actress = await Promise.all(
              starNameDiv.map( async function () {
                const actressLink = $(this);
                return {
                    text: actressLink.text(),
                    href: actressLink.attr('href')
                };
              })
            );

            // 提取电影类型信息
            const genreHeader = $('p.header:contains("類別:")');
            const genreLabels = genreHeader.next('p').find('span.genre label a');
            MovieInfo.genre = await Promise.all(
              genreLabels.map( async function () {
                const genreLink = $(this);
                return {
                    text: genreLink.text(),
                    href: genreLink.attr('href')
                };
              })
            );

            const basePicsUrl = "/pics/";
            const sampleLinks = $('div#sample-waterfall a');

            MovieInfo.extrafanart = await Promise.all( 
              sampleLinks.map( async function () {
                const sampleLink = $(this);
                let href = sampleLink.attr('href');

                if (!href.startsWith('https://') && !href.startsWith('http://')) {
                    href = "https://www.javbus.com" + href;
                }

                return basePicsUrl + Buffer.from(href).toString('base64');
              })
            );

            const coverUrl = $('a.bigImage').attr('href');
            if (coverUrl.includes("https://") || coverUrl.includes("http://")) {
                MovieInfo.cover = basePicsUrl + Buffer.from(coverUrl).toString('base64');
            } else {
                MovieInfo.cover = basePicsUrl + Buffer.from(`https://www.javbus.com${coverUrl}`).toString('base64');
            }

            return MovieInfo;
        } catch (error) {
            console.error('抓取页面内容失败:', error);
            return null; // 返回 null 表示出错
        }
    } else {
      try {
            const $ = cheerio.load(html);

            // 提取网页信息
            // 使用 Cheerio 选择器选择和填充属性
                    MovieInfo.title = $('meta[property="og:title"]').attr('content').replace('免费在线看 ','').replace('| JAV目录大全',''); // 示例：选择网页标题
            MovieInfo.code = code; // 传入的参数 code
            const Infohtml = $('div.card-body');
            MovieInfo.date = Infohtml.find('span:contains("日期")').next().text();
            MovieInfo.length = Infohtml.find('span:contains("時長;"), span:contains("时长")').next().text();

            const spanDirector = Infohtml.find('span:contains("导演:")');
            const spanMaker = Infohtml.find('span:contains("製作:")');
            const spanPublisher = Infohtml.find('span:contains("出版:")');
            const spanSeries = Infohtml.find('span:contains("系列:")');

            MovieInfo.director.text = spanDirector.next('a').text().trim();
            MovieInfo.director.href = spanDirector.next('a').attr('href');
            MovieInfo.maker.text = spanMaker.next('a').text().trim();
            MovieInfo.maker.href = spanMaker.next('a').attr('href');
            MovieInfo.publisher.text = spanPublisher.next('a').text().trim();
            MovieInfo.publisher.href = spanPublisher.next('a').attr('href');
            MovieInfo.series.text = spanSeries.next('a').text().trim();
            MovieInfo.series.href = spanSeries.next('a').attr('href');

            const starNameDiv = Infohtml.find('a.actress');
            MovieInfo.actress = starNameDiv.map(function () {
                const actressLink = $(this);
                return {
                    text: actressLink.text().trim(),
                    href: actressLink.attr('href')
                };
            }).get();

            // 提取电影类型信息
            const genreLabels = Infohtml.find('a.genre');
            MovieInfo.genre = genreLabels.map(function () {
                const genreLink = $(this);
                return {
                    text: genreLink.text().trim(),
                    href: genreLink.attr('href')
                };
            }).get();

            const basePicsUrl = "/pics/";
            const sampleLinks = $('.row.col-12.py-0.px-0.px-md-3').find('a');

            MovieInfo.extrafanart = sampleLinks.map(function () {
                const sampleLink = $(this);
                let href = sampleLink.attr('href').replace('https://pics.vpdmm.cc', 'https://pics.dmm.co.jp');

                return basePicsUrl + Buffer.from(href).toString('base64');
            }).get();

            const coverUrl = $('meta[property="og:image"]').attr('content').replace('https://pics.vpdmm.cc', 'https://pics.dmm.co.jp');
            MovieInfo.cover = basePicsUrl + Buffer.from(coverUrl).toString('base64');

            return MovieInfo;
        } catch (error) {
            console.error('抓取页面内容失败:', error);
            return null; // 返回 null 表示出错
        }
    }
}

module.exports = {
    GetInfoMsg
};
