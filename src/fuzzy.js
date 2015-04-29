import _ from 'lodash'
// returns a `words` object if its a match, else null

export function match(input, text) {
  const anywhere = anywhereMatch({input, text})
  if (anywhere) return {words: anywhere, score: 0.5}

  const fullFuzzy = fuzzyMatch({input, text})
  if (fullFuzzy) return {words: fullFuzzy, score: 0.25}

  return null
}

export function *sort(input, items) {
  let results = []
  let itemSet = _.map(items, item => ({item, matched: false}))

  for (let func of [beginningMatch, anywhereMatch, fuzzyMatch]) {
    yield* sortFunction({input, itemSet, func})
  }
}

function* sortFunction({input, itemSet, func}) {
  for (let obj of itemSet) {
    if (!obj.matched) {
      const words = func({input, text: obj.item.text})
      if (words) {
        obj.matched = true
        _.forEach(words, word => word.descriptor = obj.item.descriptor)
        yield {words, value: obj.item.value}
      }
    }
  }
}

// escape special characters, and wrap in parens (for matching)
function regexEscape (str) {
  return `(${str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/, '\\$&')})`
}

function regexSplit (str) {
  return str.split('').map(regexEscape)
}

function beginningMatch({input, text}) {
  if (_.startsWith(text.toLowerCase(), input)) {
    const matches = [{text: text.slice(0, input.length), input: true}]
    if (input.length < text.length) {
      matches.push({text: text.slice(input.length), input: false})
    }
    return matches
  }
  return null
}

function anywhereMatch({input, text}) {
  const index = text.toLowerCase().indexOf(input)

  if (index > -1) {
    const matches = []
    const endIndex = index + input.length

    if (index > 0) {
      matches.push({text: text.slice(0, index), input: false})
    }

    matches.push({text: text.slice(index, endIndex), input: true})

    if (endIndex <= text.length - 1) {
      matches.push({text: text.slice(endIndex), input: false})
    }

    return matches
  }
  return null
}


function fuzzyMatch({input, text}) {
  const chars = regexSplit(input)
  const fuzzyString = chars.reduce((a, b) => (`${a}([^${b}]*)${b}`), '^') + '(.*)$'
  const fuzzyRegex = new RegExp(fuzzyString, 'i')
  const fuzzyMatches = text.match(fuzzyRegex)

  if (fuzzyMatches) {
    const words = []
    for (let i = 1, l = fuzzyMatches.length; i < l; i++) {
      if (fuzzyMatches[i].length > 0) {
        words.push({
          text: fuzzyMatches[i],
          input: i % 2 === 0
        })
      }
    }
    return words
  }
  return null
}
