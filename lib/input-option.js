var _ = require('lodash');

function startsWith(string1, string2) {
  return string1.toLowerCase().lastIndexOf(string2.toLowerCase(), 0) === 0;
}

function regexSplit(str) {
  return str.split('').map(function (char) {
    return char.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  });
}

var InputOption = function (options) {
  _.defaults(
    this,
    _.pick(options, ['fuzzy', 'text', 'match', 'suggestion', 'completion', 'result', 'stack', 'limit']),
    {
      fuzzy: 'none',
      text: '',
      match: [],
      suggestion: [],
      completion: [],
      result: {},
      stack: [],
      limit: {}
    }
  );

};

InputOption.prototype.replaceStack = function (newStack) {
  var newOptions = _.clone(this);
  newOptions.stack = newStack;
  return new InputOption(newOptions);
};

InputOption.prototype.stackPush = function (element) {
  var newStack = this.stack.concat(element);
  return this.replaceStack(newStack);
};

InputOption.prototype.stackPop = function () {
  var newStack = this.stack.slice(0, -1);
  return this.replaceStack(newStack);
};

InputOption.prototype.replaceResult = function (newResult) {
  var newOptions = _.clone(this);
  newOptions.result = newResult;

  return new InputOption(newOptions);
};

InputOption.prototype.handleValue = function (id, value) {
  var newResult = _.clone(this.result);
  if (typeof value === 'undefined') {
    delete newResult[id];
  } else {
    newResult[id] = value;
  }
  return this.replaceResult(newResult);
};

InputOption.prototype.clearTemps = function () {
  var newResult = _.clone(this.result);
  var id;

  for (id in newResult) {
    if (startsWith(id, '_temp')) {
      delete newResult[id];
    }
  }
  return this.replaceResult(newResult);
};

InputOption.prototype.fuzzyMatch = function (text, string, category) {
  var i, l;
  var suggestions = [];
  var fuzzyString = '^(.*?)(' + regexSplit(text).join(')(.*?)(') + ')(.*?$)';
  var fuzzyRegex = new RegExp(fuzzyString, 'i');
  var fuzzyMatches = string.match(fuzzyRegex);
  if (fuzzyMatches) {
    for (i = 1, l = fuzzyMatches.length; i < l; i++) {
      if (fuzzyMatches[i].length > 0) {
        suggestions.push({
          string: fuzzyMatches[i],
          category: category,
          input: i % 2 === 0
        });
      }
    }
    return {suggestion: suggestions, text: this.text.substring(text.length)};
  }
  return null;
};

InputOption.prototype.matchString = function (string, category) {
  var i, substring;
  var result;

  if (this.fuzzy === 'all') {
    for (i = Math.min(this.text.length, string.length); i > 0; i--) {
      substring = this.text.slice(0, i);
      result = this.fuzzyMatch(substring, string, category);
      if (result) {
        return result;
      }
    }

    //if there are no fuzzy matches
    return {
      suggestion: [{string: string, category: category, input: false}],
      text: this.text
    };
  } else if (this.fuzzy === 'phrase') {
    return this.fuzzyMatch(this.text, string, category);
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
  var newOptions = _.clone(this);
  var newWord = {
    string: string,
    category: category
  };
  var matches;

  //If the text is complete
  if (this.text.length === 0) {
    if (
      (this.suggestion.length === 0) || //no suggestion
      (this.completion.length === 0 && join) //no completion, and this is join
    ) {
      newWord.input = false;
      newOptions.suggestion = this.suggestion.concat(newWord);

    //There is a suggestion
    } else {
      //This is part of the completion
      newOptions.completion = this.completion.concat(newWord);
    }

  //The text is not complete - this is a part of the text
  } else {
    //If the provided string is fully consumed by this.text
    if (this.suggestion.length === 0 && startsWith(this.text, string)) {
      //it's a match
      newOptions.match = this.match.concat(newWord);
      newOptions.text = this.text.substring(string.length);
    //the provided string is not fully consumed - it may be a suggestion
    } else {
      matches = this.matchString(string, category);
      if (matches) {
        newOptions.suggestion = this.suggestion.concat(matches.suggestion);
        newOptions.text = matches.text;

      } else {
        return null;
      }
    }
  }
  return new InputOption(newOptions);
};

module.exports = InputOption;
