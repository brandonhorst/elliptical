"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var asyncEach = require("async-each");
var Transform = require("stream").Transform;
var _ = require("lodash");

var InputOption = require("./input-option");
var LaconaError = require("./error");

function normalizeOutput(option) {
  var output = _.pick(option, ["match", "completion", "result", "sentence"]);
  var newSuggestions = [];
  var i, l, lastSuggestion, oldSuggestion;

  if (option.suggestion.length > 0) {
    newSuggestions.push(_.clone(option.suggestion[0]));
    for (i = 1, l = option.suggestion.length; i < l; i++) {
      lastSuggestion = newSuggestions[newSuggestions.length - 1];
      oldSuggestion = _.clone(option.suggestion[i]);
      if (lastSuggestion.input === oldSuggestion.input && lastSuggestion.category === oldSuggestion.category) {
        lastSuggestion.string = lastSuggestion.string + oldSuggestion.string;
      } else {
        newSuggestions.push(oldSuggestion);
      }
    }
  }
  output.suggestion = newSuggestions;

  return output;
}

var Parser = (function (Transform) {
  function Parser(options) {
    _classCallCheck(this, Parser);

    Transform.call(this, { objectMode: true });

    options = options || {};

    _.defaults(this, _.pick(options, ["langs", "sentences", "extensions", "fuzzy"]), {
      langs: ["default"],
      sentences: [],
      extensions: []
    });

    this._currentParseNumber = 0;
    this._currentPhraseParseId = 0;
    this._flushcallback = null;
    this._pending = 0;
  }

  _inherits(Parser, Transform);

  _prototypeProperties(Parser, null, {
    _getExtensions: {
      value: function _getExtensions(name) {
        return _.reduce(this.extensions, function (acc, extension) {
          if (_.contains(extension["extends"], name)) {
            acc.extenders[extension.elementName] = extension;
          }
          if (_.contains(extension.overrides, name)) {
            acc.overriders[extension.elementName] = extension;
          }

          return acc;
        }, {
          extenders: {},
          overriders: {}
        });
      },
      writable: true,
      configurable: true
    },
    _generatePhraseParseId: {
      value: function _generatePhraseParseId() {
        return this._currentPhraseParseId++;
      },
      writable: true,
      configurable: true
    },
    _transform: {
      value: function _transform(input, encoding, callback) {
        var _this = this;

        var currentParseNumber = this._currentParseNumber;
        var limits = {};
        var limitCache = [];

        var inputText;
        var group;

        // Do not accept non-string input
        if (_.isString(input)) {
          inputText = input;
        } else if (_.isObject(input) && _.isString(input.data)) {
          inputText = input.data;
          group = input.group;
        } else {
          return callback(new LaconaError("parse input must be a string"));
        }

        var addLimit = function (phraseParseId, limit) {
          if (!limits[phraseParseId]) {
            limits[phraseParseId] = limit;
          }
        };

        var parseSentence = function (phrase, done) {
          var input = new InputOption({
            fuzzy: _this.fuzzy,
            text: inputText,
            sentence: phrase.name,
            group: group
          });
          var options = {
            langs: _this.langs,
            addLimit: addLimit,
            getExtensions: _this._getExtensions.bind(_this),
            generatePhraseParseId: _this._generatePhraseParseId.bind(_this)
          };

          var sentenceData = function (input) {
            var newInputData, newInput;

            // only send the result if the parse is complete
            if (input.text === "") {
              newInputData = input.getData();

              // result should be the result of the phrase
              newInputData.result = input.result[phrase.props.id];
              newInput = new InputOption(newInputData);

              if (_.isEmpty(input.limit)) {
                _this.push({
                  event: "data",
                  id: currentParseNumber,
                  data: normalizeOutput(newInput),
                  group: group
                });
              } else {
                limitCache.push(newInput);
              }
            }
          };

          phrase.parse(input, options, sentenceData, done);
        };

        var handleLimitCache = function () {
          // for each phraseParseId, make an array of all of the limitValues submitted
          var maxNums = _.chain(limitCache).pluck("limit").reduce(function (acc, limit) {
            _.forEach(limit, function (limitValue, phraseParseId) {
              if (acc[phraseParseId]) {
                acc[phraseParseId].push(limitValue);
              } else {
                acc[phraseParseId] = [limitValue];
              }
            });
            return acc
            // sort them numerically and uniquify them (these could be reordered if that would enhance perf)
            ;
          }, {}).mapValues(function (value) {
            return _.sortBy(value);
          }).mapValues(function (value) {
            return _.uniq(value, true);
          })
          // return the maximum limitValue caceptable for each phraseParseId
          .mapValues(function (value, key) {
            return limits[key] > value.length ? value[value.length - 1] : value[limits[key] - 1];
          }).value();

          _.forEach(limitCache, function (value) {
            if (_.every(value.limit, function (dataNum, phraseParseId) {
              return dataNum <= maxNums[phraseParseId];
            })) {
              _this.push({
                event: "data",
                id: currentParseNumber,
                data: normalizeOutput(value),
                group: group
              });
            }
          });
        };

        var allPhrasesDone = function (err) {
          if (err) {
            _this.emit("error", err);
          } else {
            handleLimitCache();

            _this.push({
              event: "end",
              id: currentParseNumber,
              group: group
            });

            _this._pending--;
            if (_this._pending === 0 && _this._flushcallback) {
              _this._flushcallback();
            }
          }
        };

        this._pending++;

        this._currentParseNumber++;

        this.push({
          event: "start",
          id: currentParseNumber,
          group: group
        });

        asyncEach(this.sentences, parseSentence, allPhrasesDone);
        callback();
      },
      writable: true,
      configurable: true
    },
    _flush: {
      value: function _flush(callback) {
        if (this._pending === 0) {
          callback();
        } else {
          this._flushcallback = callback;
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Parser;
})(Transform);

module.exports = Parser;