// controllers/rate.js
const cheerio = require('cheerio');

async function GetRateMsg(code,html,rate) {
    try {
        const $ = cheerio.load(html);

        // 创建一个 RateInfo 对象，将所有属性初始化为空
        const RateInfo = {
            rate: rate,
            reviews: [],
            likes: []
        };
        
        const contentItem = $('div.content');
        // 提取评论和点赞信息
        contentItem.each((index, element) => {
            const item = $(element);
            RateInfo.reviews.push(item.find('p').text().trim());
        });
        
        const likesItem = $('span.likes-count');
        likesItem.each((index, element) => {
            const item = $(element);
            RateInfo.likes.push(item.text().trim());
        });

        return RateInfo;
    } catch (error) {
        console.error('抓取页面内容失败:', error);
        return null; // 返回 null 表示出错
    }
}

module.exports = {
    GetRateMsg
};