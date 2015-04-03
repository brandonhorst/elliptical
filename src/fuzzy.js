// returns a `words` object if its a match, else null
export function match(input, text) {
  const anywhere = anywhereMatch(input, text)
  if (anywhere) return {words: anywhere, score: 0.5}

  const fullFuzzy = fuzzyMatch(input, text)
  if (fullFuzzy) return {words: fullFuzzy, score: 0.25}

  return null
}

export function wordify(input, text) {

}

export function sort(input, text, limit) {

}

// escape special characters, and wrap in parens (for matching)
function regexEscape (str) {
  return `(${str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/, '\\$&')})`
}

function regexSplit (str) {
  return str.split('').map(regexEscape)
}

function anywhereMatch(input, thisText) {
  const index = input.toLowerCase().indexOf(thisText)

  if (index > -1) {
    const endIndex = index + thisText.length
    return [
      {text: input.slice(0, index), input: false},
      {text: input.slice(index, endIndex), input: true},
      {text: input.slice(endIndex), input: false}
    ]
  }
  return null
}


function fuzzyMatch(input, thisText) {
  const chars = regexSplit(input)
  const fuzzyString = chars.reduce((a, b) => (`${a}([^${b}]*)${b}`), '^') + '(.*)$'
  const fuzzyRegex = new RegExp(fuzzyString, 'i')
  const fuzzyMatches = thisText.match(fuzzyRegex)

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
