/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'

function regexEscape (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

function regexSplit (str) {
  return str.split('').map(regexEscape)
}

function anywhereMatch(input, thisText) {
  const fuzzyString = `^(.*?)(${regexEscape(input)})(.*?$)`
  const fuzzyRegex = new RegExp(fuzzyString, 'i')
  const fuzzyMatches = thisText.match(fuzzyRegex)

  if (fuzzyMatches) {
    return [
      {text: fuzzyMatches[1], input: false},
      {text: fuzzyMatches[2], input: true},
      {text: fuzzyMatches[3], input: false}
    ]
  }
  return null
}


function fuzzyMatch(input, thisText) {
  const fuzzyString = `^(.*?)(${regexSplit(input).join(')(.*?)(')})(.*?$)`
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

export default class Literal extends Phrase {
  suggest() {
    if (this.props.text == null) return []

    return [{suggestion: this.props.text.replace(/\n/g, ''), value: this.props.value}]
  }

  compute(input) {
    if (this.props.text == null) return []

    const inputLower = input.toLowerCase()
    const thisTextLine = this.props.text.replace(/\n/g, '')
    const thisTextLower = thisTextLine.toLowerCase()
    if (_.startsWith(inputLower, thisTextLower)) {
      return [{
        words: [{text: thisTextLine, input: true}],
        remaining: input.substring(thisTextLine.length),
        value: this.props.value
      }]
    } else if (_.startsWith(thisTextLower, inputLower)) {
      const words = [{text: thisTextLine.substring(0, input.length), input: true}]
      if (thisTextLine.length > input.length) {
        words.push({text: thisTextLine.substring(input.length), input: false})
      }
      return [{
        words,
        remaining: '',
        value: this.props.value,
        score: this.props.score || 1
      }]
    } else if (this.props.fuzzy) {
      let words = anywhereMatch(input, thisTextLine)
      if (words) return [{
        words,
        value: this.props.value,
        remaining: '',
        score: this.props.score || 2
      }]

      words = fuzzyMatch(input, thisTextLine)
      if (words) return [{
        words,
        value: this.props.value,
        remaining: '',
        score: this.props.score || 3
      }]
    }
    return []
  }

  describe() {
    return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} />
  }
}
