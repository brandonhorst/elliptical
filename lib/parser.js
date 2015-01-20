var asyncEach = require('async-each');
var inherits = require('inherits');
var Transform = require('stream').Transform;
var _ = require('lodash');

var InputOption = require('./input-option');
var LaconaError = require('./error');

function normalizeOutput(option) {
  var output = _.pick(option, ['match', 'completion', 'result', 'history']);
  var newSuggestions = [];
  var i, l, lastSuggestion, oldSuggestion;

  if (option.suggestion.length > 0) {
    newSuggestions.push(option.suggestion[0]);
    for (i = 1, l = option.suggestion.length; i < l; i++) {
      lastSuggestion = newSuggestions[newSuggestions.length - 1];
      oldSuggestion = option.suggestion[i];
      if (lastSuggestion.input === oldSuggestion.input && lastSuggestion.category === oldSuggestion.category) {
        lastSuggestion.string += oldSuggestion.string;
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

  this.langs = options.langs || ['default'];
  this.sentences = options.sentences || [];
  this.extensions = options.extensions || [];

  this._currentParseNumber = 0;
  this._optionsForInput = {'fuzzy': options.fuzzy || false};
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

Parser.prototype._transform = function _transform(inputText, encoding, callback) {
  var this_ = this;

  var _currentParseNumber = this._currentParseNumber;

  function parseSentence(phrase, done) {
    var options = {
      input: new InputOption(this_._optionsForInput, inputText),
      langs: this_.langs,
      getExtensions: this_._getExtensions.bind(this_)
    };

    function sentenceData(option) {
      var newOption;

      //only send the result if the parse is complete
      if (option.text === '') {

        //result should be the result of the phrase
        newOption = option.replaceResult(option.result[phrase.props.id]);

        this_.push({
          event: 'data',
          id: _currentParseNumber,
          data: normalizeOutput(newOption)
        });
      }
    }

    phrase.parse(options, sentenceData, done);
  }

  function allPhrasesDone(err) {
    if (err) {
      this.emit('error', err);
    } else {
      this_.push({
        event: 'end',
        id: _currentParseNumber
      });

      this_._pending--;
      if (this_._pending === 0 && this_._flushcallback) {
        this_._flushcallback();
      }

    }
  }

  this._pending++;

  this._currentParseNumber++;

  //Do not accept non-string input
  if (!(typeof inputText === 'string' || inputText instanceof String)) {
    return callback(new LaconaError('parse input must be a string'));
  }

  this.push({
    event: 'start',
    id: _currentParseNumber
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
