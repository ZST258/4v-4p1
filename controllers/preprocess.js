const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203'
};

async function fetchData(url) {
  try {
    const response = await axios.get(url, { headers });
    return response;
  } catch (error) {
    return null;
  }
}

//一个网页链接对象
const websiteUrl = {
   javbus: "https://www.javbus.com/",
   javmenu: "https://javmenu.com/zh/",
   javdb: "https://javdb.com/search?f=all&q="
}

// 验证番号的合法性
async function validateCode(req) {
  // 判断 code 属性是否为字符串，只包含大小写字母、数字和'-'符号
  if (typeof req.body.code !== 'string' || !/^[a-zA-Z0-9\-_.]+$/.test(req.body.code)) {
    console.log(req.body.code);
    req.body.type = 'error';
    return;
  }

  if (req.body.code.toLowerCase().startsWith('fc2-') || req.body.code.toLowerCase().startsWith('f2c-') || req.body.code.toLowerCase().startsWith('fc2-ppv') || req.body.code.toLowerCase().startsWith('f2c-ppv')) {
    if (req.body.type !== "rate") {
      req.body.type = 'fc2' + req.body.type;
    }
    req.body.fc2num = req.body.code.toLowerCase().replace('fc2-ppv-', '').replace('fc2-', '').replace('f2c-ppv-', '').replace('f2c-', '');
    return;
  }
}

async function validateType(req) {
  // 判断 type 属性是否为 'info'、'url'、'magnet' 或 'rate'
  if (!['info', 'url', 'magnet', 'rate'].includes(req.body.type)) {
    req.body.type = 'error';
    return;
  }
}

async function fetchInfoHtml(req, url) {
  req.body.site = 'javbus';
  const data = await fetchData(url);
  if (data && data.status >= 200 && data.status < 300 ) {
    return data.data;
  }

  // 大写字母抓取失败，尝试小写字母抓取
  req.body.code = req.body.code.toLowerCase();
  const lowerUrl = `${websiteUrl[req.body.site]}${req.body.code}`;
  const lowerData = await fetchData(lowerUrl);

  if (lowerData && lowerData.status >= 200 && lowerData.status < 300) {
    return lowerData.data;
  }

  // 小写字母抓取失败，尝试 javmenu
  req.body.code = req.body.code.toUpperCase();
  req.body.site = "javmenu";
  const javmenuUrl = `${websiteUrl[req.body.site]}${req.body.code}`;
  const javmenuData = await fetchData(javmenuUrl);
  if (javmenuData && javmenuData.status >= 200 && javmenuData.status < 300) {
    return javmenuData.data;
  }

  // 所有尝试失败，设置 type 为 'error'
  req.body.type = 'error';
  //终止执行函数
  return;
}

// 这里将传入的 fetchData 函数作为参数
async function fetchMagnetHtml(req, url) {
    // 使用 fetchData 函数抓取页面内容
    const response = await fetchData(url);
    if (!response || response.status < 200 || response.status >= 300) {
      return;
    }

    const $ = cheerio.load(response.data);

    // 获取详情页链接
    const detailUrl = $('div.movie-list.h.cols-4.vcols-8 > div.item:first-child > a').attr('href').trim();

    // 请求详情页
    const response1 = await fetchData(`https://javdb.com${detailUrl}`);
    if (!response1 || response1.status < 200 || response1.status >= 300) {
      return;
    }

    // 这里可以处理 response1，例如解析 HTML，提取所需信息
    return response1.data;
}

async function fetchRateHtml(req, url) {
    // 使用 fetchData 函数抓取页面内容
    const response = await fetchData(url);
    if (!response || response.status < 200 || response.status >= 300) {
      return;
    }

    const $ = cheerio.load(response.data);
    // 抓取评分信息
    const firstItem = $('div.movie-list.h.cols-4.vcols-8 > div.item:first-child');
    req.body.rate = firstItem.find('a > div.score > span.value').text().trim();
    // 获取详情页链接
    const detailUrl = $('div.movie-list.h.cols-4.vcols-8 > div.item:first-child > a').attr('href').trim();

    // 请求详情页
    const response1 = await fetchData(`https://javdb.com${detailUrl}/reviews/lastest`);
    if (!response1 || response1.status < 200 || response1.status >= 300) {
      return;
    }

    // 这里可以处理 response1，例如解析 HTML，提取所需信息
    return response1.data;
}

async function PreprocessRequest(req) {
  // 校验 code 的合法性
  await validateCode(req);

  // 校验 type 的合法性
  await validateType(req);

  // 使用 switch 根据不同的类型设置 site
  switch (req.body.type) {
    case 'info':
      req.body.site = 'javbus';
      req.body.code = req.body.code.toUpperCase();
      //执行对应的抓取函数
      req.body.html = await fetchInfoHtml(req, `${websiteUrl[req.body.site]}${req.body.code}`);
      break;
    case 'rate':
      req.body.site = 'javdb';
      req.body.code = req.body.code.toUpperCase();
      req.body.html = await fetchRateHtml(req, `${websiteUrl[req.body.site]}${req.body.code}`)
      break;
    default:
      req.body.site = 'javdb';
      req.body.code = req.body.code.toUpperCase();
      req.body.html = await fetchMagnetHtml(req, `${websiteUrl[req.body.site]}${req.body.code}`)
      break;
  } 
  req.key = req.body.type + '|' + req.body.code;
  return req.body;
}

module.exports = {
  PreprocessRequest
};