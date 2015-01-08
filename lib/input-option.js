var Category = require('./category');
var util = require('./util');

function startsWith(string1, string2) {
  return string1.lastIndexOf(string2, 0) === 0;
}

function regexSplit(str) {
  return str.split('').map(function (char) {
    return char.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  });
}

var InputOption = function(options, text, match, suggestion, completion, result, stack) {
  this.options = options || {};
  this.text = typeof text !== 'undefined' ? text : '';
  this.match = typeof match !== 'undefined' ? match : [];
  this.suggestion = typeof suggestion !== 'undefined' ?
    suggestion :
    {charactersComplete: 0, words: [] };
  this.completion = typeof completion !== 'undefined' ? completion : [];
  this.result = typeof result !== 'undefined' ? result : {};
  this.stack = typeof stack !== 'undefined' ? stack : [];
};

InputOption.prototype.stackPush = function (element) {
  var newStack = this.stack.concat(element);
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, this.result, newStack);
};

InputOption.prototype.stackPop = function () {
  var newStack = this.stack.slice(0, -1);
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, this.result, newStack);
};

InputOption.prototype.handleValue = function(id, value) {
  var newResult = util.clone(this.result);
  if (typeof value === 'undefined') {
    delete newResult[id];
  } else {
    newResult[id] = value;
  }
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, newResult, this.stack);
};

InputOption.prototype.clearTemps = function() {
  var newResult = util.clone(this.result);
  var id;

  for (id in newResult) {
    if (startsWith(id, '@temp')) {
      delete newResult[id];
    }
  }
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, newResult, this.stack);
};

InputOption.prototype.replaceResult = function(newResult) {
  return new InputOption(this.options, this.text, this.match, this.suggestion, this.completion, newResult, this.stack);
};

InputOption.prototype.doesStringMatchThisText = function(string) {
  var fuzzyRegex;
  var fuzzyRegexString;
  var fuzzyMatches;
  var i;

  if (this.options && this.options.fuzzy) {

    //performance optimization - no need to check if they are identical,
    // as is often the case
    if (string.toLowerCase() === this.text.toLowerCase()) {
      return {
        textUsed: string.length,
        stringUsed: string.length
      };
    }
    for (i = Math.min(this.text.length, string.length); i > 0; i--) {
      fuzzyRegexString = '^.*?' + regexSplit(this.text.slice(0, i)).join('.*?');
      fuzzyRegex = new RegExp(fuzzyRegexString, 'i');

      fuzzyMatches = string.match(fuzzyRegex);
      if (fuzzyMatches && typeof fuzzyMatches[0] !== undefined) {
        return {
          textUsed: i,
          stringUsed: fuzzyMatches[0].length
        };
      }
    }
    return {
      textUsed: 0,
      stringUsed: 0
    };
  } else {
    if (startsWith(string.toLowerCase(), this.text.toLowerCase())) {
      return {
        textUsed: this.text.length,
        stringUsed: this.text.length
      };
    } else {
      return null;
    }
  }
};

InputOption.prototype.doesThisTextMatchString = function(string) {
  if (startsWith(this.text.toLowerCase(), string.toLowerCase())) {
    return string.length;
  } else {
    return null;
  }
};

InputOption.prototype.handleString = function(string, category) {
  var newText = this.text;
  var newMatch = this.match.slice(0);
  var newSuggestion = util.clone(this.suggestion);
  var newCompletion = this.completion.slice(0);
  var newResult = util.clone(this.result);
  var newWord = {
    string: string,
    category: category
  };

  var stringMatchesThisText;
  var thisTextMatchesString;
  var charactersUsed;

  //If the text is complete
  if (this.text.length === 0) {
    //If there is no suggestion
    if (this.suggestion && this.suggestion.words && this.suggestion.words.length === 0) {
      //This text is the new suggestion!
      newSuggestion = {
        charactersComplete: 0,
        words: [newWord]
      };

    //If there is a suggestion but this is just punctuation
  } else if (this.completion.length === 0 && category === Category.punctuation) {
      //Just tack it onto the suggestion
      newSuggestion.words.push(newWord);

    //There is a suggestion and this is not punctuation
    } else {
      //This is part of the completion
      newCompletion.push(newWord);
    }

  //The text is not complete - this is a part of the text
  } else {
    thisTextMatchesString = this.doesThisTextMatchString(string);
    stringMatchesThisText = this.doesStringMatchThisText(string);

    //If the provided string is a match, and it is fully consumed
    if (this.suggestion.words.length === 0 && thisTextMatchesString !== null) {
      //tack it onto the match and remove it from the text
      newMatch.push(newWord);
      newText = this.text.substring(thisTextMatchesString);

    //The provided string is a match, and it is not fully consumed
    } else if (stringMatchesThisText !== null) {
      //This is the beginning of the suggestion, and the end of the text
      charactersUsed = stringMatchesThisText.textUsed < this.text.length ?
        string.length :
        stringMatchesThisText.stringUsed;

      newSuggestion = {
        charactersComplete: this.suggestion.charactersComplete + charactersUsed,
        words: this.suggestion.words.concat(newWord)
      };
      newText = this.text.slice(stringMatchesThisText.textUsed);

    //This is not a match at all
    } else {
      return null;
    }
  }

  return new InputOption(this.options, newText, newMatch, newSuggestion, newCompletion, newResult, this.stack);
};

module.exports = InputOption;
