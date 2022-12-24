var express = require('express');
var fs = require('fs');
var _ = require('lodash');
var router = express.Router();
// const basicAuth = require('express-basic-auth');

const keys = require('./my-own-project-token.json');
// const keys = require('./google-oauth-client-secret-credentials.json');

const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/admin', function(req, res, next) {
  res.render('admin');
});


router.get('/get-oauth-url', async function(req, res, next) {
  try {
    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      req.query.callback,
      // keys.web.redirect_uris[0],
    );
    
    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/youtube',
      // scope: 'https://www.googleapis.com/auth/userinfo.profile',
    });
    res.send({
      'authorizeUrl': authorizeUrl,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
  
});

router.get('/get-code-token', async function(req, res, next) {
  try {
    const code = req.query.code;
    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      req.query.callback,
      // keys.web.redirect_uris[0],
    );
    const r = await oAuth2Client.getToken(code);
    // console.log(r);
    // oAuth2Client.setCredentials(r.tokens);
    res.send({
      'token': r.tokens,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/datas', async function(req, res, next) {
  const dataStr = fs.readFileSync(`./data.json`).toString();
  // await fs.writeFileSync(`./data.json`, JSON.stringify(dict, null, 2));
  res.status(200).send(JSON.parse(dataStr));
});


router.post('/datas', async function(req, res, next) {
  const dataStr = fs.readFileSync(`./data.json`).toString();
  const datas = JSON.parse(dataStr);
  let idx = 0;
  if (datas.length > 1){
    idx = _.get(datas[datas.length-1],'_id',0); 
  }
  idx++;
  const newData = req.body||{};
  newData._id = idx;
  datas.push(newData);
  await fs.writeFileSync(`./data.json`, JSON.stringify(datas, null, 2));
  res.status(204).send('OK');
});

module.exports = router;
