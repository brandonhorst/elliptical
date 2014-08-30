var _ = require('lodash');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ElementFactory = require('./element-factory');
var Phrase = require('./phrase');
var InputOption = require('./input-option');
var literal = require('./literal');

var Parser = function(options) {
  options = options || {};
  this.optionsForInput = _.pick(options, 'fuzzy');
  this.sentences = options.sentences || [];
  this.langs = options.sentences || [];
  this.phrases = [];
  this.middleware = [];
  this.understand(literal);
  this.currentParseNumber = 0;

  //_phraseAccessor is passed around as an independent function (by element-factory)
  // but it needs to retain its reference to this, so we will bind it here.
  Parser.prototype._phraseAccessor = _.bind(function(name) {
    var phraseFilter = function(phrase) {
      return phrase.name === name || phrase['extends'].indexOf(name) !== -1;
    };

    return _.filter(this.phrases, phraseFilter);
  }, this);
};

util.inherits(Parser, EventEmitter);

//takes a grammar (or just a schema), and defines a set of words for Lacona to understand
Parser.prototype.understand = function(options) {
  var scope = options.scope;
  var schema = options.schema || options;
  var phrase;
  var elementFactory;
  var i;
  var l;

  if (!util.isArray(schema)) {
    schema = [schema];
  }

  l = schema.length;

  for (i = 0; i < l; i++) {
    phrase = schema[i];
    elementFactory = new ElementFactory(scope, this);
    this.phrases.push(new Phrase(phrase, scope, elementFactory));
  }
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

Parser.prototype.parse = function(inputText, lang) {
  var this_ = this;
  var thisParseNumber;
  var sentenceFilter = _.reduce(this.sentences, function (acc, sentence) {
    acc.name = sentence;
    return acc;
  }, {});

  var parsePhrase = function(phrase, done) {
    var input = new InputOption(this_.optionsForInput, phrase, inputText);

    var phraseData = function(option) {

      var eachMiddleware = function(call, done) {
        return call(option, done);
      };

      var middlewareDone = function(err) {
        if (err) {
          return done(err);
        }
        return this_.emit('data', option);
      };

      if (option.text === '' && thisParseNumber === this_.currentParseNumber) {
        return async.eachSeries(this_.middleware, eachMiddleware, middlewareDone);
      }
    };

    phrase.parse(input, lang, null, phraseData, done);
  };

  var allPhrasesDone = function(err) {
    if (err) {
      this_.emit('error', err);
    } else if (thisParseNumber === this_.currentParseNumber) {
      this_.emit('end');
    }
  };

  if (typeof lang === 'undefined' || lang === null) {
    /* global window */
    if (typeof window !== 'undefined' &&
      typeof window.navigator !== 'undefined' &&
      typeof window.navigator.language !== undefined) {
      lang = window.navigator.language.replace('-', '_');
    } else if  (process && process.env && process.env.LANG) {
      lang = process.env.LANG.split('.')[0];
    } else {
      lang = 'default';
    }
  }

  this.currentParseNumber++;
  thisParseNumber = this.currentParseNumber;


  async.each(_.filter(this.phrases, sentenceFilter), parsePhrase, allPhrasesDone);
  return this;
};

var run = function(inputOption, done) {
  return inputOption.sentence.scope[inputOption.sentence.run](inputOption.result, done);
};

var nextText = function(inputOption, done) {
  var match, matchAndSuggestion;

  match = _.reduce(inputOption.match, function(string, match) {
    return string + match.string;
  }, '');

  matchAndSuggestion = _.reduce(inputOption.suggestion.words, function(string, suggestion) {
    return string + suggestion.string;
  }, match);

  done(null, matchAndSuggestion);
};

module.exports = {
  Parser: Parser,
  run: run,
  nextText: nextText
};