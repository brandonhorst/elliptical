/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'

function regexSplit (str) {
  return str.split('').map(function (char) {
    return char.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
  })
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
      return [{words, remaining: '', value: this.props.value}]
    } else if (this.props.fuzzy) {
      const words = fuzzyMatch(input, this.props.text)
      if (words) {
        return [{words, value: this.props.value, remaining: ''}]
      } else {
        return []
      }
    } else {
      return []
    }
  }

  describe() {
    return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} />
  }
}
