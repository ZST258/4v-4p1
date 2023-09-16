// controllers/info.js
const axios = require('axios');
const cheerio = require('cheerio');

async function GetInfoMsg(fc2num) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203'
    };
    const href = 'https://adult.contents.fc2.com/article/' + fc2num + '/'
    try {
        // 使用 axios 和 cheerio 抓取页面内容
        const response = await axios.get(href, { headers });
        const $ = cheerio.load(response.data);
        // 抓取规则
	const expr_studio = $('#top > div > section > div > section > div > ul > li:nth-child(3) > a');
	const expr_release = $('.items_article_Releasedate p');
	const expr_runtime = $('.items_article_info');
	const expr_director = $('#top > div > section > div > section > div > ul > li:nth-child(3) > a');
	const expr_actor = $('#top > div > section > div > section > div > ul > li:nth-child(3) > a');
	const expr_cover = $('.items_article_MainitemThumb > span > img');
	const expr_extrafanart = $('.items_article_SampleImagesArea > li > a');
	const expr_tags = $('#top > div.items_article_left > section.items_article_header > div > section > div.items_article_headerInfo > section > div').find('a');
        const expr_title = $('#top > div.items_article_left > section.items_article_header > div > section > div.items_article_headerInfo > h3');

        // 创建一个 MovieInfo 对象，将所有属性初始化为空
        const Fc2Info = {
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
            cover:"",
            actress: [],
            genre: [],
            extrafanart: []
        };

	// 使用抓取规则来提取信息
	Fc2Info.title = $('title').text().trim();
        Fc2Info.code = "FC2-" + fc2num;
	Fc2Info.maker.text = expr_studio.text().trim();
	Fc2Info.date = expr_release.text().trim().replace('販売日 : ','');
	Fc2Info.length = expr_runtime.text().trim();
	Fc2Info.director.text = expr_director.text().trim();
        Fc2Info.actress = await Promise.all(
          expr_actor.map( await function() {
            const item = $(this);
    	    return { 
                text: item.text(),
                href: ""             
            };       
	  })
        );
	Fc2Info.cover = expr_cover.attr('src');
        const basePicsUrl = "/pics/";
	Fc2Info.extrafanart = await Promise.all(
          expr_extrafanart.map( async function() {
            const item = $(this).attr('href');
            return basePicsUrl+ Buffer.from(item).toString('base64');
          })
        );
        Fc2Info.genre = await Promise.all(
          expr_tags.map( async function() {
    	    return { 
                text: $(this).text(),
                href: ""             
            };
	  })
        );     
        return Fc2Info;
    } catch (error) {
        console.error('抓取页面内容失败:', error);
        return null; // 返回 null 表示出错
    }
}

module.exports = {
    GetInfoMsg
};