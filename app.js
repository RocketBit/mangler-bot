var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const fs = require('fs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const ngramMangling = true;

// Define the possible patterns
// 0 = adjective
// 1 = adverb
// 2 = noun
// 3 = verb
const patterns = [
    [],
    [[2]],
    [[0,2],[2,2]],
    [[0,0,2],[2,2,2],[0,2,2],[1,0,2]],
    [[0,0,0,2],[0,2,2,2][2,2,2,2],[1,0,0,2],[1,0,2,2]],
    [[0,0,0,0,2],[0,2,2,2,2],[2,2,2,2,2],[1,0,2,2,2]]
]

// Load the word lists
var lists = [];
// bigram map of int - two keys
var bigrams = new Map();
// freq map of int - one key
var freq = new Map();

try {
    if (ngramMangling) {
	// Load the source text from clean word list
	let sentences = new Array(0);
	let wordlist = fs.readFileSync('./lists/clean.txt').toString();
	sentences = wordlist.split('\n');
	
	// for each sentence
	sentences.forEach(function(sentence) {
	    // for every word in the sentence
	    let prev = "";
	    sentence.split(' ').forEach(function(word) {
		// increment frequency map
		if (freq.get(word) === undefined) {
		    freq.set(word,1);
		} else {
		    freq.set(word,freq.get(word)+1);
		}

		// increment bigrams map
		if (prev != "") {
		    let bigram = [prev,word];
		    if (bigrams.get(bigram) === undefined) {
			bigrams.set(bigram,1);
		    } else {
			bigrams.set(bigram,bigrams.get(bigram)+1);
		    }
		}
		prev = word;
	    })
	})
    } else {
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
    }

} catch(e) {
    console.error(e);
}

console.log("Loaded word lists!");

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

// DEBUG ....................................
//var text = 'foss';
//mangleMe([],text,[]);
// DEBUG ....................................

// DEBUG function mangleMe(body, text, res){
function mangleMe(body, res) {
    
    // returns the path to the word list which is separated by `\n`
    // const wordListPath = require('word-list');
    // const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');

    // DEBUG .....................................................
    let acro = text.split(' ')[0];
    //    let acro = body.text.split(' ')[0];
    // DEBUG .....................................................
    
    if(!acro || acro === ''){
        res.send('Please include an acronym with your request.');
        return;
    }

    if(acro.length > 5 && !ngramMangling){
        res.send("Let's not be silly. Keep them 5 characters or less, mmmkay?");
        return;
    }
    
    if(/[^a-z]/i.test(acro)){
        res.send('Sorry, we can only do letters.');
        return;
    }

    let newWords = [];

    if (ngramMangling) {
	newWords = partsManglerNGram(acro,[]);
    } else {
	let patternSet = patterns[acro.length]
	console.log(patternSet)
	let rando = Math.floor(Math.random() * patternSet.length)
	console.log(rando)
	let pattern = patternSet[rando]
	console.log(pattern)

	newWords = partsMangler(acro,[],pattern);
    }
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
    
    let payload = {
        response_type: 'in_channel',
        text: message
    };
    res.send(payload);
}

function partsMangler(acro,words,pattern){
    // 0 = adjective
    // 1 = adverb
    // 2 = noun
    // 3 = verb
    words = words || [];

    if(words && words.length >= acro.length){
        return words;
    }
    let type = pattern[words.length]
    let possible = lists[type].filter(w => {
        return (w.charAt(0).toLowerCase() === acro.charAt(words.length).toLowerCase());
    });
    let word = possible[Math.floor(Math.random() * possible.length)];
    if(type === 3){
        word += "s";
    }
    words.push(word);
    if(words.length < acro.length){
        return partsMangler(acro,words,pattern);
    } else {
        return words;
    }
}

function partsManglerNGram(acro,words){
    
    words = words || [];

    if(words && words.length >= acro.length){
        return words;
    }

    let word = '';

    if (words.length == 0) {
	// Pick random word starting with the correct letter
	let possible = [];
	for (var wordFromFreq of freq.keys()) {
	    if (wordFromFreq.charAt(0).toLowerCase() === acro.charAt(words.length).toLowerCase())
		possible.push(wordFromFreq);
	}
	word = possible[Math.floor(Math.random() * possible.length)];

	console.log(acro.charAt(words.length).toUpperCase() + " - Picked random word: " + word + " from " + possible.length + " options.");
    } else {
	// Pick word which results in the highest P(word | previousWord)
	// P(word | previousWord) = count(previousWord followed by word)
	// Given that previousWord is already set

	let highestFreq = -1;
	let bestMatchingWord = '';
	let previousWord = words[words.length - 1];
	let matchCount = 0;

	for (var [key, value] of bigrams) {
	    // If the first word of the bigram is the previous word and the second word
	    // of the bigram starts with the correct letter
	    if (key[0].toLowerCase() === previousWord.toLowerCase()
		&& key[1].charAt(0).toLowerCase() === acro.charAt(words.length).toLowerCase()) {

		matchCount++;
		// If it is the best matching so far
		if (value > highestFreq) {
		    highestFreq = value;
		    bestMatchingWord = key[1];
		}
	    }
	}

	word = bestMatchingWord;
	if (highestFreq != -1)
	    console.log(acro.charAt(words.length).toUpperCase() + " - Best matching word: " +
			bestMatchingWord + " from " + matchCount + " possibilities. Freq " + highestFreq);
	
	// If there is no match
	if (highestFreq == -1) {
	    // Just pick a word at random
	    let possible = [];
	    for (var wordFromFreq of freq.keys()) {
		if (wordFromFreq.charAt(0).toLowerCase() === acro.charAt(words.length).toLowerCase())
		    possible.push(wordFromFreq);
	    }
	    word = possible[Math.floor(Math.random() * possible.length)];
	    console.log(acro.charAt(words.length).toUpperCase() + " - Picked random word: " + word + " from " + possible.length + " options.");
	}
    }

    word = word.toLowerCase();
    
    words.push(word);
    
    if(words.length < acro.length){ 
        return partsManglerNGram(acro,words);
    } else {
        return words;
    }
}
