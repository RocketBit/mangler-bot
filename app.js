const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Define the possible patterns
// 0 = adjective
// 1 = adverb
// 2 = noun
// 3 = verb
const patterns = [
  [],
  [[2]],
  [[0, 2], [2, 2]],
  [[0, 0, 2], [2, 2, 2], [0, 2, 2], [1, 0, 2]],
  [[0, 0, 0, 2], [0, 2, 2, 2][2, 2, 2, 2], [1, 0, 0, 2], [1, 0, 2, 2]],
  [[0, 0, 0, 0, 2], [0, 2, 2, 2, 2], [2, 2, 2, 2, 2], [1, 0, 2, 2, 2]]
]

// Load the word lists
let lists = [];
try {
  //lists.push(fs.readFileSync('./lists/adjectives.txt').toString().split('\r\n'));
  lists.push(require('./lists/adjectives-2.json').adjectives);
  console.log(lists[0].length + ' adjectives');
  //lists.push(fs.readFileSync('./lists/adverbs.txt').toString().split('\n'));
  lists.push(require('./lists/adverbs-2.json').adverbs);
  console.log(lists[1].length + ' adverbs');
  //lists.push(fs.readFileSync('./lists/nouns.txt').toString().split('\r\n'));
  lists.push(require('./lists/nouns-2.json').nouns);
  console.log(lists[2].length + ' nouns');
  //lists.push(fs.readFileSync('./lists/verbs.txt').toString().split('\r\n'));
  let vlist = require('./lists/verbs-tense.json').verbs.map(v => v.present);
  lists.push(vlist);
  console.log(lists[3].length + ' verbs');
} catch (e) {
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

function mangleMe(body, res) {

  // returns the path to the word list which is separated by `\n`
  // const wordListPath = require('word-list');
  // const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');

  const acro = body.text.split(' ')[0];
  if (!acro || acro === '') {
    res.send('Please include an acronym with your request.');
    return;
  }

  if (acro.length > 5) {
    res.send("Let's not be silly. Keep them 5 characters or less, mmmkay?");
    return;
  }

  if (/[^a-z]/i.test(acro)) {
    res.send('Sorry, we can only do letters.');
    return;
  }

  const patternSet = patterns[acro.length]
  console.log(patternSet)
  const rando = Math.floor(Math.random() * patternSet.length)
  console.log(rando)
  const pattern = patternSet[rando]
  console.log(pattern)

  const newWords = partsMangler(acro, [], pattern);
  console.log(newWords);

  let message = ''

  if (body.twitter) {
    message = acro.toUpperCase() + ':'
    newWords.forEach(w => {
      message += '\n' + w.charAt(0).toUpperCase() + w.substr(1)
    })
  } else {
    message = '*' + acro.toUpperCase() + ':*';

    newWords.forEach(w => {
      message += '\n<https://en.wiktionary.org/wiki/' + w + '|' + w.charAt(0).toUpperCase() + w.substr(1) + '>';
    });
  }

  const payload = {
    response_type: 'in_channel',
    text: message
  };
  res.send(payload);
}

function partsMangler(acro, words, pattern) {
  // 0 = adjective
  // 1 = adverb
  // 2 = noun
  // 3 = verb
  words = words || [];

  if (words && words.length >= acro.length) {
    return words;
  }
  const type = pattern[words.length]
  const possible = lists[type].filter(w => {
    return (w.charAt(0).toLowerCase() === acro.charAt(words.length).toLowerCase());
  });
  let word = possible[Math.floor(Math.random() * possible.length)];
  if (type === 3) {
    word += "s";
  }
  words.push(word);
  if (words.length < acro.length) {
    return partsMangler(acro, words, pattern);
  } else {
    return words;
  }
}





