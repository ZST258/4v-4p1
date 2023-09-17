// javmenu.js

// 提取信息的函数，接收 MovieInfo 对象和 $ 参数
async function extractInfoFromJavmenu(MovieInfo, $, code) {

    MovieInfo.title = $('meta[property="og:title"]').attr('content').replace('免费在线看 ', '').replace('| JAV目录大全', ''); // 示例：选择网页标题
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
}

module.exports = {
    extractInfoFromJavmenu
};
