// javbus.js

// 提取信息的函数，接收 MovieInfo 对象和 $ 参数
async function extractInfoFromJavbus(MovieInfo, $, code) {
    // 填充 MovieInfo 对象的属性
    MovieInfo.title = $('title').text().replace(' - JavBus', '');
    MovieInfo.code = code;
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
        starNameDiv.map(async function () {
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
        genreLabels.map(async function () {
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
        sampleLinks.map(async function () {
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
}

module.exports = {
    extractInfoFromJavbus
};