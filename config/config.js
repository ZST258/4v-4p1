const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const axios = require('axios');
const cheerio = require('cheerio');

// 创建命令行参数解析器
const argv = yargs
  .option('config', {
    alias: 'c',
    describe: 'Path to custom configuration file',
    type: 'string',
  })
  .argv;

// 使用命令行参数中指定的配置文件路径，如果不存在则使用默认配置文件
const customConfigPath = argv.config || path.join(__dirname, 'config.json');
const configData = fs.readFileSync(customConfigPath, 'utf-8');
const config = JSON.parse(configData);

//新建一个网页链接对象
config.websiteUrl = {
   javbus: "https://www.javbus.com/",
   javmenu: "https://javmenu.com/zh/",
   javdb: "https://javdb.com/search?f=all&q="
}

// 导出配置对象
module.exports = config;
