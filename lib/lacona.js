var asyncEach = require('async-each');
var asyncEachSeries = require('async-each-series');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var Grammar = require('./grammar');
var InputOption = require('./input-option');

function getDefaultLanguage() {

  /* global window */
  if (typeof window !== 'undefined' &&
    typeof window.navigator !== 'undefined' &&
    typeof window.navigator.language !== 'undefined') {
    return window.navigator.language.replace('-', '_');

  } else if  (process && process.env && process.env.LANG) {
    return process.env.LANG.split('.')[0];

  } else {
    return 'default';
  }
}

var Parser = function(options) {
  options = options || {};
  this.optionsForInput = {'fuzzy': options.fuzzy};
  this.sentences = options.sentences || [];

  if (options.langs) {
    this.langs = options.langs;
  } else {
    this.langs = [getDefaultLanguage()];
  }

  this.grammars = [];
  this.middleware = [];
  this.currentParseNumber = 0;
  this.currentlyParsing = false;
};

inherits(Parser, EventEmitter);

//takes a grammar, and defines a set of words for Lacona to understand
Parser.prototype.understand = function(grammarObject) {
  this.grammars.push(new Grammar(grammarObject, this.grammars));

  return this;
};

//use defines middleware.
// It must be passed a function that accepts 2 arguments, an inputOption,
// and a callback that should be passed an error (or null) and a modulated inputOption.
// This will be passed to the data event (or the next middleware) rather than the inputOption itself.
Parser.prototype.use = function(next) {
  this.middleware.push(next);
  return this;
};


Parser.prototype.parse = function(inputText) {
  var this_ = this;
  var thisParseNumber;

  function sentenceReduce(acc, grammar) {
    var i, l;
    var phrase;

    for (l = grammar.phrases.length, i = 0; i < l; i++) {
      phrase = grammar.phrases[i];

      if (this_.sentences.indexOf(phrase.name) !== -1) {
        acc.push(phrase);
      }
    }
    return acc;
  }

  var sentences = this.grammars.reduce(sentenceReduce, []);

  var parsePhrase = function(phrase, done) {
    var input = new InputOption(this_.optionsForInput, inputText);

    function phraseData(option) {

      function eachMiddleware(call, done) {
        return call(option, done);
      }

      function middlewareDone(err) {
        if (err) {
          return done(err);
        }
        return this_.emit('data', option);
      }

      if (option.text === '' && thisParseNumber === this_.currentParseNumber) {
        return asyncEachSeries(this_.middleware, eachMiddleware, middlewareDone);
      }
    }

    phrase.parse(input, this_.langs, null, phraseData, done);
  };

  function allPhrasesDone(err) {
    if (err) {
      this_.emit('error', err);
    } else if (thisParseNumber === this_.currentParseNumber) {
      this.currentlyParsing = false;
      this_.emit('end');
    }
  }

  if (this.currentlyParsing) {
    this.emit('end');
  }

  this.currentlyParsing = true;

  this.currentParseNumber++;
  thisParseNumber = this.currentParseNumber;

  asyncEach(sentences, parsePhrase, allPhrasesDone);
  return this;
};

function nextText(inputOption, done) {
  var match, matchAndSuggestion;

  match = inputOption.match.reduce(function(string, match) {
    return string + match.string;
  }, '');

  matchAndSuggestion = inputOption.suggestion.words.reduce(function(string, suggestion) {
    return string + suggestion.string;
  }, match);

  done(null, matchAndSuggestion);
}


module.exports = {
  Parser: Parser,
  Error: require('./error'),
  nextText: nextText
};
