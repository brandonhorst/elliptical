var _ = require('lodash');

function startsWith(string1, string2) {
  return string1.toLowerCase().lastIndexOf(string2.toLowerCase(), 0) === 0;
}

function regexSplit(str) {
  return str.split('').map(function (char) {
    return char.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  });
}

var InputOption = function (options, text, match, suggestion, completion, result, stack, history) {
  this.options = options || {};
  this.text = typeof text !== 'undefined' ? text : '';
  this.match = typeof match !== 'undefined' ? match : [];
  this.suggestion = typeof suggestion !== 'undefined' ? suggestion : [];
  this.completion = typeof completion !== 'undefined' ? completion : [];
  this.result = typeof result !== 'undefined' ? result : {};
  this.stack = typeof stack !== 'undefined' ? stack : [];
  this.history = typeof history !== 'undefined' ? history : [];
};

InputOption.prototype.stackPush = function (element) {
  var newStack = this.stack.concat(_.omit(element, 'id'));
  var newHistory = this.history.concat(element.id);
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, this.result, newStack, newHistory);
};

InputOption.prototype.stackPop = function () {
  var newStack = this.stack.slice(0, -1);
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, this.result, newStack, this.history);
};

InputOption.prototype.handleValue = function (id, value) {
  var newResult = _.clone(this.result);
  if (typeof value === 'undefined') {
    delete newResult[id];
  } else {
    newResult[id] = value;
  }
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, newResult, this.stack, this.history);
};

InputOption.prototype.clearTemps = function () {
  var newResult = _.clone(this.result);
  var id;

  for (id in newResult) {
    if (startsWith(id, '_temp')) {
      delete newResult[id];
    }
  }
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, newResult, this.stack, this.history);
};

InputOption.prototype.replaceResult = function (newResult) {
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, newResult, this.stack, this.history);
};

InputOption.prototype.matchString = function (string, category) {
  var i, j, l;
  var suggestions;
  var fuzzyString, fuzzyRegex, fuzzyMatches;
  if (this.options.fuzzy) {
    for (i = Math.min(this.text.length, string.length); i > 0; i--) {
      suggestions = [];
      fuzzyString = '^(.*?)(' + regexSplit(this.text.slice(0, i)).join(')(.*?)(') + ')(.*?$)';
      fuzzyRegex = new RegExp(fuzzyString, 'i');
      fuzzyMatches = string.match(fuzzyRegex);
      if (fuzzyMatches) {
        for (j = 1, l = fuzzyMatches.length; j < l; j++) {
          if (fuzzyMatches[j].length > 0) {
            suggestions.push({
              string: fuzzyMatches[j],
              category: category,
              input: j % 2 === 0
            });
          }
        }
        return {suggestion: suggestions, text: this.text.substring(i)};
      }
    }

    //if there are no fuzzy matches
    return {
      suggestion: [{string: string, category: category, input: false}],
      text: this.text
    };
  } else {
    if (startsWith(string, this.text)) {
      return {
        suggestion: [
          {string: string.substring(0, this.text.length), category: category, input: true},
          {string: string.substring(this.text.length), category: category, input: false}
        ],
        text: this.text.substring(string.length)
      };
    } else {
      return null;
    }
  }
};

InputOption.prototype.handleString = function (string, category, join) {
  var newText = this.text;
  var newMatch = this.match.slice(0);
  var newSuggestion = this.suggestion;
  var newCompletion = this.completion.slice(0);
  var newResult = _.clone(this.result);
  var newWord = {
    string: string,
    category: category
  };
  var matches;

  //If the text is complete
  if (this.text.length === 0) {
    //If there is no suggestion
    if (this.suggestion && this.suggestion.length === 0) {
      //This text is the new suggestion!
      newWord.input = false;
      newSuggestion = this.suggestion.concat(newWord);

    //If there is a suggestion but this is just punctuation
    } else if (this.completion.length === 0 && join) {
      //Just tack it onto the suggestion
      newSuggestion.push(newWord);

    //There is a suggestion
    } else {
      //This is part of the completion
      newCompletion.push(newWord);
    }

  //The text is not complete - this is a part of the text
  } else {
    //If the provided string is fully consumed by this.text
    if (this.suggestion.length === 0 && startsWith(this.text, string)) {
      //it's a match
      newMatch.push(newWord);
      newText = this.text.substring(string.length);
    //the provided string is not fully consumed - it may be a suggestion
    } else {
      matches = this.matchString(string, category);
      if (matches) {
        newSuggestion = this.suggestion.concat(matches.suggestion);
        newText = matches.text;

      } else {
        return null;
      }
    }
  }
  return new InputOption(this.options, newText, newMatch, newSuggestion, newCompletion, newResult, this.stack, this.history);
};

module.exports = InputOption;
