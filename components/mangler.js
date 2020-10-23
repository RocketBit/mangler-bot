const lists = require('./listBuilder').loadLists()

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

const mangleMe = (body, res) => {

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

const partsMangler = (acro, words, pattern) => {
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

module.exports = {
  mangleMe,
  partsMangler
}
