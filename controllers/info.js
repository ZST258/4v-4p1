// controllers/info.js
const axios = require('axios');
const cheerio = require('cheerio');
const { extractInfoFromJavbus } = require('../crawlerlib/javbus.js');
const { extractInfoFromJavmenu } = require('../crawlerlib/javmenu.js');

async function GetInfoMsg(code, html, site) {
    try {
        const $ = cheerio.load(html);

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

        switch (site) {
            case "javbus":
                // 使用导入的函数来提取信息
                await extractInfoFromJavbus(MovieInfo, $, code);
                break;
            case "javmenu":
                await extractInfoFromJavmenu(MovieInfo, $, code);
                break;
            default:
                console.error('未知的站点:', site);
                return null;
        }

        return MovieInfo;
    } catch (error) {
        console.error('抓取页面内容失败:', error);
        return null;
    }
}

module.exports = {
    GetInfoMsg
};
