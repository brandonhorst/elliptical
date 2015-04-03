/** @jsx createElement */
import _ from 'lodash'
import {match} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'

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
        value: this.props.value,
        score: 1
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
        score: this.props.score || 0.75
      }]
    } else if (this.props.fuzzy) {
      const result = match(input, thisTextLine)
      if (result) {
        result.remaining = ''
        result.value = this.props.value
        return [result]
      }
    }
    return []
  }

  describe() {
    return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} />
  }
}
