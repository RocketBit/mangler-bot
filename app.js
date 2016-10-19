var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const fs = require('fs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Load the word lists
var lists = [];
try {
    lists.push(fs.readFileSync('./lists/adjectives.txt').toString().split('\r\n'));
    lists.push(fs.readFileSync('./lists/adverbs.txt').toString().split('\r\n'));
    lists.push(fs.readFileSync('./lists/nouns.txt').toString().split('\r\n'));
    lists.push(fs.readFileSync('./lists/verbs.txt').toString().split('\r\n'));
} catch(e) {
    console.error(e);
}

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

function mangleMe(body, res){
    
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
    
    let newWords = partsMangler(acro);
    
    let message = '*' + acro.toUpperCase() + ':*';
    
    newWords.forEach(w => {
        message += '\n<https://en.wiktionary.org/wiki/' + w + '|' + w.charAt(0).toUpperCase() + w.substr(1) + '>';
    });
    
    let payload = {
        response_type: 'in_channel',
        text: message
    };
    res.send(payload);
}

function partsMangler(acro,words,last){
    // 0 = adjective
    // 1 = adverb
    // 2 = noun
    // 3 = verb
    words = words || [];
    last = last===undefined?-1:last;
    
    if(words && words.length >= acro.length){
        return words;
    }
    let types = [];
    // The most basic of grammar algorithms. 
    switch (last) {
        case -1:
            types = [0,2];
            break;
        case 0:
            types = [2];
            break;
        case 1:
            types = [3];
            break;
        case 2:
            types = [1,3];
            break;
        case 3:
            types = [0,1,2];
            break;
    }
    last = types[Math.floor(Math.random() * types.length)];
    
    let possible = lists[last].filter(w => {
        return (w.charAt(0).toLowerCase() === acro.charAt(words.length).toLowerCase());
    });
    words.push(possible[Math.floor(Math.random() * possible.length)]);
    if(words.length < acro.length){
        return partsMangler(acro,words,last);
    } else {
        return words;
    }
}





