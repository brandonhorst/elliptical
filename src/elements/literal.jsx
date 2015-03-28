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
    return [{suggestion: this.props.text, value: this.props.value}]
  }

  compute(input) {
    const inputLower = input.toLowerCase()
    const thisTextLower = this.props.text.toLowerCase()
    if (_.startsWith(inputLower, thisTextLower)) {
      return [{
        words: [{text: this.props.text, input: true}],
        remaining: input.substring(this.props.text.length),
        value: this.props.value
      }]
    } else if (_.startsWith(thisTextLower, inputLower)) {
      const words = [{text: this.props.text.substring(0, input.length), input: true}]
      if (this.props.text.length > input.length) {
        words.push({text: this.props.text.substring(input.length), input: false})
      }
      return [{
        words,
        remaining: '',
        value: this.props.value,
        score: this.props.score || 1
      }]
    } else if (this.props.fuzzy) {
      let words = anywhereMatch(input, this.props.text)
      if (words) return [{
        words,
        value: this.props.value,
        remaining: '',
        score: this.props.score || 2
      }]

      words = fuzzyMatch(input, this.props.text)
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
