const loadLists = () => {
  // Load the word lists
  const lists = [];
  try {
    //lists.push(fs.readFileSync('./lists/adjectives.txt').toString().split('\r\n'));
    lists.push(require('./../lists/adjectives-2.json').adjectives);
    console.log(lists[0].length + ' adjectives');
    //lists.push(fs.readFileSync('./lists/adverbs.txt').toString().split('\n'));
    lists.push(require('./../lists/adverbs-2.json').adverbs);
    console.log(lists[1].length + ' adverbs');
    //lists.push(fs.readFileSync('./lists/nouns.txt').toString().split('\r\n'));
    lists.push(require('./../lists/nouns-2.json').nouns);
    console.log(lists[2].length + ' nouns');
    //lists.push(fs.readFileSync('./lists/verbs.txt').toString().split('\r\n'));
    let vlist = require('./../lists/verbs-tense.json').verbs.map(v => v.present);
    lists.push(vlist);
    console.log(lists[3].length + ' verbs');
  } catch (e) {
    console.error(e);
  }
  return lists
}

module.exports = {
  loadLists
}
