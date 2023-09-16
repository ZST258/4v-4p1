const cheerio = require('cheerio');

async function GetMagnetInfo(code,html) {
    try {
        const $ = cheerio.load(html);
        // 缓存查询结果
        const itemColumns = $('.item.columns.is-desktop');

        const magnetLinks = await Promise.all(
            itemColumns.map(async (index, element) => {
                // 创建一个对象来存放磁链信息
                const magnetInfo = {
                    title: '',
                    tags: [],
                    size: '',
                    url: '',
                    date: ''
                };
                const item = $(element);

                // 缓存查询结果以减少重复查询
                const spanName = item.find('span.name');
                const spanTag = item.find('span.tag');
                const spanMeta = item.find('span.meta');
                const link = item.find('a');
                const spanTime = item.find('span.time');

                magnetInfo.title = spanName.text().trim();
                magnetInfo.tags = spanTag.map((i, el) => $(el).text().trim()).get();
                magnetInfo.size = spanMeta.text().trim();
                magnetInfo.url = link.attr('href');
                magnetInfo.date = spanTime.text().trim();

                return magnetInfo;
            })
        );

        return magnetLinks;
    } catch (error) {
        console.error('抓取页面内容失败:', error);
        return null; // 返回 null 表示出错
    }
}

module.exports = {
    GetMagnetInfo
};