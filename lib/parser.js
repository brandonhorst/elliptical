var asyncEach = require('async-each');
var inherits = require('inherits');
var Transform = require('stream').Transform;
var _ = require('lodash');

var InputOption = require('./input-option');
var LaconaError = require('./error');

function normalizeOutput(option) {
  var output = _.pick(option, ['match', 'completion', 'result', 'sentence']);
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

function Parser(options) {
  Transform.call(this, {objectMode: true});

  options = options || {};

  _.defaults(
    this,
    _.pick(options, ['langs', 'sentences', 'extensions', 'fuzzy']),
    {
      langs: ['default'],
      sentences: [],
      extensions: []
    }
  );

  this._currentParseNumber = 0;
  this._currentPhraseParseId = 0;
  this._flushcallback = null;
  this._pending = 0;
}

inherits(Parser, Transform);

Parser.prototype._getExtensions = function _getExtensions(name) {
  return _.reduce(this.extensions, function (acc, extension) {
    if (_.contains(extension.extends, name)) {
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
};

Parser.prototype._generatePhraseParseId = function () {
  return this._currentPhraseParseId++;
};


Parser.prototype._transform = function _transform(input, encoding, callback) {
  var this_ = this;

  var currentParseNumber = this._currentParseNumber;
  var limits = {};
  var limitCache = [];

  var inputText;
  var group = undefined;

  //Do not accept non-string input
  if (_.isString(input)) {
    inputText = input;
  } else if (_.isObject(input) && _.isString(input.data)) {
    inputText = input.data;
    group = input.group;
  } else {
    return callback(new LaconaError('parse input must be a string'));
  }

  function addLimit(phraseParseId, limit) {
    if (!limits[phraseParseId]) {
      limits[phraseParseId] = limit;
    }
  }

  function parseSentence(phrase, done) {
    var input = new InputOption({
      fuzzy: this_.fuzzy,
      text: inputText,
      sentence: phrase.name,
      group: group
    });
    var options = {
      langs: this_.langs,
      addLimit: addLimit,
      getExtensions: this_._getExtensions.bind(this_),
      generatePhraseParseId: this_._generatePhraseParseId.bind(this_)
    };

    function sentenceData(input) {
      var newInputData, newInput;

      //only send the result if the parse is complete
      if (input.text === '') {
        newInputData = input.getData();

        //result should be the result of the phrase
        newInputData.result = input.result[phrase.props.id];
        newInput = new InputOption(newInputData);

        if (_.isEmpty(input.limit)) {
          this_.push({
            event: 'data',
            id: currentParseNumber,
            data: normalizeOutput(newInput),
            group: group
          });
        } else {
          limitCache.push(newInput);
        }
      }
    }

    phrase.parse(input, options, sentenceData, done);
  }

  function handleLimitCache() {

    //for each phraseParseId, make an array of all of the limitValues submitted
    var maxNums = _.chain(limitCache).pluck('limit').reduce(function (acc, limit) {
      _.forEach(limit, function (limitValue, phraseParseId) {
        if (acc[phraseParseId]) {
          acc[phraseParseId].push(limitValue);
        } else {
          acc[phraseParseId] = [limitValue];
        }
      });
      return acc;
    //sort them numerically and uniquify them (these could be reordered if that would enhance perf)
    }, {}).mapValues(function (value) {
      return _.sortBy(value);
    }).mapValues(function (value) {
      return _.uniq(value, true);
    //return the maximum limitValue caceptable for each phraseParseId
    }).mapValues(function (value, key) {
      return limits[key] > value.length ? value[value.length - 1] : value[limits[key] - 1];
    }).value();

    _.forEach(limitCache, function (value) {
      if (_.every(value.limit, function (dataNum, phraseParseId) {
        return dataNum <= maxNums[phraseParseId];
      })) {
        this_.push({
          event: 'data',
          id: currentParseNumber,
          data: normalizeOutput(value),
          group: group
        });
      }
    });
  }

  function allPhrasesDone(err) {
    if (err) {
      this.emit('error', err);
    } else {
      handleLimitCache();

      this_.push({
        event: 'end',
        id: currentParseNumber,
        group: group
      });

      this_._pending--;
      if (this_._pending === 0 && this_._flushcallback) {
        this_._flushcallback();
      }
    }
  }

  this._pending++;

  this._currentParseNumber++;

  this.push({
    event: 'start',
    id: currentParseNumber,
    group: group
  });

  asyncEach(this.sentences, parseSentence, allPhrasesDone);
  callback();
};

Parser.prototype._flush = function (callback) {
  if (this._pending === 0) {
    callback();
  } else {
    this._flushcallback = callback;
  }
};

module.exports = Parser;
