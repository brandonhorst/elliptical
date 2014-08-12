(function() {
  var InputOption, PartOfSpeech, _;

  require('./stringshims');

  PartOfSpeech = require('./part-of-speech');

  _ = require('lodash');

  InputOption = (function() {
    function InputOption(options, sentence, text, match, suggestion, completion, result) {
      this.options = options;
      this.sentence = sentence != null ? sentence : null;
      this.text = text != null ? text : "";
      this.match = match != null ? match : [];
      this.suggestion = suggestion != null ? suggestion : {
        words: []
      };
      this.completion = completion != null ? completion : [];
      this.result = result != null ? result : {};
    }

    InputOption.prototype.handleValue = function(id, value) {
      var newResult;
      newResult = _.cloneDeep(this.result);
      if (typeof value === 'undefined') {
        delete newResult[id];
      } else {
        newResult[id] = value;
      }
      return new InputOption(this.options, this.sentence, this.text, this.match, this.suggestion, this.completion, newResult);
    };

    InputOption.prototype.clearTemps = function() {
      var id, newResult;
      newResult = _.cloneDeep(this.result);
      for (id in newResult) {
        if (id.startsWith('@temp')) {
          delete newResult[id];
        }
      }
      return new InputOption(this.options, this.sentence, this.text, this.match, this.suggestion, this.completion, newResult);
    };

    InputOption.prototype.replaceResult = function(newResult) {
      return new InputOption(this.options, this.sentence, this.text, this.match, this.suggestion, this.completion, newResult);
    };

    InputOption.prototype.doesStringContainThisText = function(string) {
      var fuzzyRegex, fuzzyRegexString, _ref, _ref1, _ref2;
      if ((_ref = this.options) != null ? _ref.fuzzy : void 0) {
        fuzzyRegexString = _.reduce(this.text, function(whole, character) {
          return "" + whole + character + ".*?";
        }, '^.*?');
        fuzzyRegex = new RegExp(fuzzyRegexString, 'i');
        return (_ref1 = string.match(fuzzyRegex)) != null ? (_ref2 = _ref1[0]) != null ? _ref2.length : void 0 : void 0;
      } else {
        if (string.toLowerCase().startsWith(this.text.toLowerCase())) {
          return this.text.length;
        } else {
          return null;
        }
      }
    };

    InputOption.prototype.doesThisTextContainString = function(string) {
      if (this.text.toLowerCase().startsWith(string.toLowerCase())) {
        return string.length;
      } else {
        return null;
      }
    };

    InputOption.prototype.handleString = function(string, partOfSpeech) {
      var newCompletion, newMatch, newResult, newSuggestion, newText, newWord, stringContainsThisText, thisTextContainsString, _ref;
      newText = this.text;
      newMatch = _.cloneDeep(this.match);
      newSuggestion = _.cloneDeep(this.suggestion);
      newCompletion = _.cloneDeep(this.completion);
      newResult = _.cloneDeep(this.result);
      newWord = {
        string: string,
        partOfSpeech: partOfSpeech
      };
      if (this.text.length === 0) {
        if (((_ref = this.suggestion.words) != null ? _ref.length : void 0) === 0) {
          newSuggestion = {
            charactersComplete: 0,
            words: [newWord]
          };
        } else if (this.completion.length === 0 && partOfSpeech === PartOfSpeech.punctuation) {
          newSuggestion.words.push(newWord);
        } else {
          newCompletion.push(newWord);
        }
      } else {
        thisTextContainsString = this.doesThisTextContainString(string);
        stringContainsThisText = this.doesStringContainThisText(string);
        if (thisTextContainsString != null) {
          newMatch.push(newWord);
          newText = this.text.substring(thisTextContainsString);
        } else if (stringContainsThisText != null) {
          newSuggestion = {
            charactersComplete: stringContainsThisText,
            words: [newWord]
          };
          newText = "";
        } else {
          return null;
        }
      }
      return new InputOption(this.options, this.sentence, newText, newMatch, newSuggestion, newCompletion, newResult);
    };

    return InputOption;

  })();

  module.exports = InputOption;

}).call(this);
