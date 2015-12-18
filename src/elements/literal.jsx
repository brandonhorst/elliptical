/** @jsx createElement */
import _ from 'lodash'
import {match} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'

export default class Literal extends Phrase {
  suggest() {
    if (this.props.text == null) return []

    return [{text: this.props.text.replace(/\n/g, ''), value: this.props.value, score: this.props.score || 1}]
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
        score: this.props.score || 1
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
      const result = match(input, thisTextLine)
      if (result) {
        result.remaining = ''
        result.value = this.props.value
        result.score = this.props.score || result.score
        return [result]
      }
    }
    return []
  }

  decorate (input) {
    return [{
      words: [{text: this.props.text, input: false, decorator: true}],
      value: this.props.value,
      remaining: input,
      score: 1
    }]
  }

  describe() {
    if (this.props.decorate) {
      return (
        <choice limit={1}>
          <literal {...this.props} decorate={false} />
          <value compute={this.decorate.bind(this)} />
        </choice>
      )
    } else {
      return <value
        compute={this.compute.bind(this)}
        suggest={this.suggest.bind(this)}
        qualifier={this.props.qualifier}
        category={this.props.category} />
    }
  }
}
