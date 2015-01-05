var asyncEach = require('async-each');
var inherits = require('inherits');
var Transform = require('stream').Transform;

var Grammar = require('./grammar');
var InputOption = require('./input-option');
var LaconaError = require('./error');

function getPhrasesNamed(grammars, names) {
  return grammars.map(function(grammar) {
    return grammar.phrases;
  }).reduce(function(acc, phrases) {
    return acc.concat(phrases);
  }, []).filter(function(phrase) {
    return names.indexOf(phrase.name) !== -1;
  });
}

function Parser(options) {
  Transform.call(this, {objectMode: true});

  options = options || {};
  this.optionsForInput = {'fuzzy': options.fuzzy};
  this.sentences = options.sentences || [];
  this.langs = options.langs || ['default'];
  this.grammars = [];
  this.currentParseNumber = 0;
}

inherits(Parser, Transform);

//takes a grammar, and defines a set of words for Lacona to understand
Parser.prototype.understand = function(grammarObject) {
  this.grammars.push(new Grammar(grammarObject, this.grammars));

  return this;
};

Parser.prototype._transform = function(inputText, encoding, done) {
  var this_ = this;

  var currentParseNumber = this.currentParseNumber;

  var sentences = getPhrasesNamed(this.grammars, this.sentences);

  function parsePhrase(phrase, done) {
    var options = {
      input: new InputOption(this_.optionsForInput, inputText),
      langs: this_.langs,
      context: null,
    };

    function phraseData(option) {
      //only send the result if the parse is complete
      if (option.text === '') {
        this_.push({
          event: 'data',
          id: currentParseNumber,
          data: option
        });
      }
    }

    phrase.parse(options, phraseData, done);
  }

  function allPhrasesDone(err) {
    this_.push({
      event: 'end',
      id: currentParseNumber
    });

    done(err);
  }

  this.currentParseNumber++;

  //Do not accept non-string input
  if (!(typeof inputText === 'string' || inputText instanceof String)) {
    done(new LaconaError('parse input must be a string'));
    return;
  }

  this.push({
    event: 'start',
    id: currentParseNumber
  });

  asyncEach(sentences, parsePhrase, allPhrasesDone);
};


module.exports = {
  Parser: Parser,
  Error: require('./error')
};
