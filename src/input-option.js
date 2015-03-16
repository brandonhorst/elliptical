import _ from 'lodash'

function regexSplit (str) {
  return str.split('').map(function (char) {
    return char.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
  })
}

const defaults = {
  fuzzy: 'none',
  text: '',
  match: [],
  suggestion: [],
  completion: [],
  result: {},
  stack: [],
  callbacks: []
}

export function createOption(options) {
  return _.defaults(options, defaults)
}

function fuzzyMatch(option, text, string, category) {
  var i, l
  var suggestions = []
  var fuzzyString = '^(.*?)(' + regexSplit(text).join(')(.*?)(') + ')(.*?$)'
  var fuzzyRegex = new RegExp(fuzzyString, 'i')
  var fuzzyMatches = string.match(fuzzyRegex)
  if (fuzzyMatches) {
    for (i = 1, l = fuzzyMatches.length; i < l; i++) {
      if (fuzzyMatches[i].length > 0) {
        suggestions.push({
          string: fuzzyMatches[i],
          category: category,
          input: i % 2 === 0
        })
      }
    }
    return {suggestion: suggestions, text: option.text.substring(text.length)}
  }
  return null
}

function getActualFuzzy(option, fuzzyOverride) {
  if (option.fuzzy === 'none' || fuzzyOverride === 'none') {
    return 'none'
  } else if (option.fuzzy === 'phrase' || fuzzyOverride === 'phrase') {
    return 'phrase'
  } else {
    return 'all'
  }
}

function matchString(option, string, options) {
  var i, substring
  var result
  var actualFuzzy = getActualFuzzy(option, options.fuzzy)
  var text = option.text

  if (actualFuzzy === 'all') {
    for (i = Math.min(text.length, string.length); i > 0; i--) {
      substring = text.slice(0, i)
      result = fuzzyMatch(option, substring, string, options.category)
      if (result) {
        return result
      }
    }

    // if there are no fuzzy matches
    return {
      suggestion: [{string: string, category: options.category, input: false}],
      text: text
    }
  } else if (actualFuzzy === 'phrase') {
    return fuzzyMatch(option, text, string, options.category)
  } else {
    if (_.startsWith(string.toLowerCase(), text.toLowerCase())) {
      return {
        suggestion: [
          {string: string.substring(0, text.length), category: options.category, input: true},
          {string: string.substring(text.length), category: options.category, input: false}
        ],
        text: text.substring(string.length)
      }
    } else {
      return null
    }
  }
}

export function handleString(option, string, options) {
  const newWord = {
    string: string,
    category: options.category
  }

  // If the text is complete
  if (option.text.length === 0) {
    if (
      (_.isEmpty(option.suggestion)) || // no suggestion
      (_.isEmpty(option.completion) && options.join) // no completion, and it's a join
    ) {
      newWord.input = false
      return _.assign({}, option, {suggestion: option.suggestion.concat(newWord)})

    // There is a suggestion
    } else {
      // This is part of the completion
      return _.assign({}, option, {completion: option.completion.concat(newWord)})
    }

  // The text is not complete - it's a part of the text
  } else {
    // If the provided string is fully consumed by option.text
    if (_.isEmpty(option.suggestion) && _.startsWith(option.text.toLowerCase(), string.toLowerCase())) {
      // it's a match
      return _.assign({}, option, {
        match: option.match.concat(newWord),
        text: option.text.substring(string.length)
      })
    // the provided string is not fully consumed - it may be a suggestion
    } else {
      const matches = matchString(option, string, options)
      if (matches) {
        return _.assign({}, option, {
          suggestion: option.suggestion.concat(matches.suggestion),
          text: matches.text
        })
      } else {
        return null
      }
    }
  }
}
