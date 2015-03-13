import _ from 'lodash'
import I from 'immutable'

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
  return I.fromJS(_.defaults(options, defaults))
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
    return I.fromJS({suggestion: suggestions, text: option.get('text').substring(text.length)})
  }
  return null
}

function getActualFuzzy(option, fuzzyOverride) {
  if (option.get('fuzzy') === 'none' || fuzzyOverride === 'none') {
    return 'none'
  } else if (option.get('fuzzy') === 'phrase' || fuzzyOverride === 'phrase') {
    return 'phrase'
  } else {
    return 'all'
  }
}

function matchString(option, string, options) {
  var i, substring
  var result
  var actualFuzzy = getActualFuzzy(option, options.fuzzy)
  var text = option.get('text')

  if (actualFuzzy === 'all') {
    for (i = Math.min(text.length, string.length); i > 0; i--) {
      substring = text.slice(0, i)
      result = fuzzyMatch(option, substring, string, options.category)
      if (result) {
        return result
      }
    }

    // if there are no fuzzy matches
    return I.fromJS({
      suggestion: [{string: string, category: options.category, input: false}],
      text: text
    })
  } else if (actualFuzzy === 'phrase') {
    return fuzzyMatch(option, text, string, options.category)
  } else {
    if (_.startsWith(string.toLowerCase(), text.toLowerCase())) {
      return I.fromJS({
        suggestion: [
          {string: string.substring(0, text.length), category: options.category, input: true},
          {string: string.substring(text.length), category: options.category, input: false}
        ],
        text: text.substring(string.length)
      })
    } else {
      return null
    }
  }
}

export function handleString(option, string, options) {
  const newWord = I.Map({
    string: string,
    category: options.category
  })

  // If the text is complete
  if (option.get('text').length === 0) {
    if (
      (option.get('suggestion').count() === 0) || // no suggestion
      (option.get('completion').count() === 0 && options.join) // no completion, and it's a join
    ) {
      return option.update('suggestion', suggestion => suggestion.push(newWord.set('input', false)))

    // There is a suggestion
    } else {
      // This is part of the completion
      return option.update('completion', completion => completion.push(newWord))
    }

  // The text is not complete - it's a part of the text
  } else {
    // If the provided string is fully consumed by option.text
    if (option.get('suggestion').count() === 0 && _.startsWith(option.get('text').toLowerCase(), string.toLowerCase())) {
      // it's a match
      return option
        .update('match', match => match.push(newWord))
        .update('text', text => text.substring(string.length))
    // the provided string is not fully consumed - it may be a suggestion
    } else {
      const matches = matchString(option, string, options)
      if (matches) {
        return option
          .update('suggestion', suggestion => suggestion.concat(matches.get('suggestion')))
          .set('text', matches.get('text'))
      } else {
        return null
      }
    }
  }
}
