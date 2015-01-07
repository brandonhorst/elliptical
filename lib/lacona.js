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

  //maintain a list of
  this._flushcallback = null;
  this._pending = 0;
}

inherits(Parser, Transform);

//takes a grammar, and defines a set of words for Lacona to understand
Parser.prototype.understand = function understand(grammarObject) {
  this.grammars.push(new Grammar(grammarObject, this.grammars));

  return this;
};

Parser.prototype.clearGrammars = function clearGrammars() {
  this.grammars.length = 0;

  return this;
};

Parser.prototype._transform = function _transform(inputText, encoding, callback) {
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
    if (err) {
      this.emit('error', err);
    } else {
      this_.push({
        event: 'end',
        id: currentParseNumber
      });

      this_._pending--;
      if (this_._pending === 0 && this_._flushcallback) {
        this_._flushcallback();
      }

    }
  }

  this._pending++;

  this.currentParseNumber++;

  //Do not accept non-string input
  if (!(typeof inputText === 'string' || inputText instanceof String)) {
    return callback(new LaconaError('parse input must be a string'));
  }

  this.push({
    event: 'start',
    id: currentParseNumber
  });

  asyncEach(sentences, parsePhrase, allPhrasesDone);
  callback();
};

Parser.prototype._flush = function (callback) {
  if (this._pending === 0) {
    callback();
  } else {
    this._flushcallback = callback;
  }
};

module.exports = {
  Parser: Parser,
  Error: require('./error')
};
