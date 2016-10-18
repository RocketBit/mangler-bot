var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const slackToken = 'Rs1Onnojds3P7jFEKWhoLInM';

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

function mangleMe(body, res){
    
    const fs = require('fs');
    // returns the path to the word list which is separated by `\n`
    const wordListPath = require('word-list');
    const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
    
    let acro = body.text.split(' ')[0];
    if(!acro || acro === ''){
        res.send('Please include an acronym with your request.');
        return;
    }
    
    if(acro.length > 10){
        res.send("Let's not be silly. Keep them 10 characters or less, mmmkay?");
        return;
    }
    
    if(/[^a-z]/i.test(acro)){
        res.send('Sorry, we can only do letters.');
        return;
    }
    
    let message = '*' + acro.toUpperCase() + ':*';
    acro.split('').forEach(l => {
        let words = wordArray.filter(w => {
            return w.charAt(0) === l.toLowerCase();
        });
        let word = words[Math.floor(Math.random()*words.length)];
        message += '\n<http://www.dictionary.com/browse/' + word + '|' + l.toUpperCase() + word.substr(1) + '>';
    });
    
    let payload = {
        response_type: 'in_channel',
        text: message
    };
    res.send(payload);
}