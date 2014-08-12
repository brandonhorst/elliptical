(function() {
  var ElementFactory, EventEmitter, InputOption, Parser, Phrase, async, nextText, run, util, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  async = require('async');

  EventEmitter = require('events').EventEmitter;

  util = require('util');

  ElementFactory = require('./element-factory');

  Phrase = require('./phrase');

  InputOption = require('./input-option');

  Parser = (function(_super) {
    __extends(Parser, _super);

    function Parser(options) {
      this._phraseAccessor = __bind(this._phraseAccessor, this);
      this.optionsForInput = _.pick(options, 'fuzzy');
      this.options = _.omit(options, 'fuzzy');
      this.phrases = [];
      this.middleware = [];
      this.understand(require('./literal'));
      this.currentParseNumber = 0;
    }

    Parser.prototype._phraseAccessor = function(name) {
      return _.filter(this.phrases, function(phrase) {
        return phrase.name === name || __indexOf.call(phrase["extends"], name) >= 0;
      });
    };

    Parser.prototype.understand = function(options) {
      var elementFactory, phrase, schema, scope, _i, _len, _ref;
      scope = options.scope;
      schema = (_ref = options.schema) != null ? _ref : options;
      if (!util.isArray(schema)) {
        schema = [schema];
      }
      for (_i = 0, _len = schema.length; _i < _len; _i++) {
        phrase = schema[_i];
        elementFactory = new ElementFactory(scope, this);
        this.phrases.push(new Phrase(phrase, scope, elementFactory));
      }
      return this;
    };

    Parser.prototype.use = function(next) {
      this.middleware.push(next);
      return this;
    };

    Parser.prototype.parse = function(inputText, lang) {
      var allPhrasesDone, gotData, phraseIsSentence, thisParseNumber, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      lang = (_ref = (_ref1 = lang != null ? lang : typeof window !== "undefined" && window !== null ? (_ref2 = window.navigator) != null ? (_ref3 = _ref2.language) != null ? typeof _ref3.replace === "function" ? _ref3.replace('-', '_') : void 0 : void 0 : void 0 : void 0) != null ? _ref1 : typeof process !== "undefined" && process !== null ? (_ref4 = process.env) != null ? (_ref5 = _ref4.LANG) != null ? typeof _ref5.split === "function" ? (_ref6 = _ref5.split('.')) != null ? _ref6[0] : void 0 : void 0 : void 0 : void 0 : void 0) != null ? _ref : 'default';
      this.currentParseNumber++;
      thisParseNumber = this.currentParseNumber;
      phraseIsSentence = function(item) {
        return item.run != null;
      };
      gotData = (function(_this) {
        return function(phrase, done) {
          var input;
          input = new InputOption(_this.optionsForInput, phrase, inputText);
          return phrase.parse(input, lang, null, function(option) {
            if (option.text === '' && thisParseNumber === _this.currentParseNumber) {
              return async.eachSeries(_this.middleware, function(call, done) {
                return call(option, done);
              }, function(err) {
                if (err != null) {
                  return done(err);
                }
                return _this.emit('data', option);
              });
            }
          }, done);
        };
      })(this);
      allPhrasesDone = (function(_this) {
        return function(err) {
          if (err != null) {
            return _this.emit('error', err);
          } else if (thisParseNumber === _this.currentParseNumber) {
            return _this.emit('end');
          }
        };
      })(this);
      async.each(_.filter(this.phrases, phraseIsSentence), gotData, allPhrasesDone);
      return this;
    };

    return Parser;

  })(EventEmitter);

  run = function(inputOption, done) {
    return inputOption.sentence.scope[inputOption.sentence.run](inputOption.result, done);
  };

  nextText = function(inputOption, done) {
    var match, matchAndSuggestion;
    match = _.reduce(inputOption.match, function(string, match) {
      return string + match.string;
    }, '');
    matchAndSuggestion = _.reduce(inputOption.suggestion.words, function(string, suggestion) {
      return string + suggestion.string;
    }, match);
    return done(null, matchAndSuggestion);
  };

  module.exports = {
    Parser: Parser,
    run: run,
    nextText: nextText
  };

}).call(this);
