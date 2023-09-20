// webRouter.js

const express = require('express');
const router = express.Router();
const path = require('path');

const staticDir = path.resolve(`${__dirname}/../public`);
router.use(express.static(staticDir));
// 匹配 genre、series、director、studio 路由
router.get(/^(\/(genre|series|director|studio|star|label|actress))(.*)/, (req, res) => {
  // req.params[0] 匹配到的路径部分
  res.sendFile(`${staticDir}/html/result.html`);
});

//排行榜
router.get(/^\/grade/, (req, res) => {
  res.sendFile(`${staticDir}/html/result1.html`);
});

// 匹配 /censored/genre、/censored/series、/censored/director、/censored/studio 路由
router.get(/^(\/(censored|uncensored)\/(genre|series|director|maker|publisher))(.*)/, (req, res) => {
  // req.params[0] 匹配到的路径部分
  res.sendFile(`${staticDir}/html/result1.html`);
});

// 创建查询路由
router.get('/find', (req, res) => {
  res.sendFile(`${staticDir}/html/find.html`);
});

// 应用首页
router.get('/', (req, res) => {
  res.sendFile(`${staticDir}/html/index.html`);
});

router.get('/detail/:code', (req, res) => {
    res.sendFile(`${staticDir}/html/detail.html`);
});

router.get(/^\/error/ , (req,res) => {
    res.sendFile(`${staticDir}/html/error.html`);
});

module.exports = router;
