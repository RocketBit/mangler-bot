const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const { mangleMe } = require('./components/mangler')
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const slackToken = ''; // If you want to tie it to a single Slack team, use this

app.get('/', function (req, res) {
  console.log(req);
  res.send('Hello World!');
});

app.post('/', function (req, res) {
  console.log(req.body);
  /*if(req.body.token !== slackToken){
    res.status(401).send('Error: Unauthorized application');
  }*/
  //res.send('Got the request!');
  mangleMe(req.body, res);
});

app.listen(2095, function () {
  console.log('Example app listening on port 2095!');
});







