  /** @jsx createElement */
import _ from 'lodash'
import {match} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'

export class Literal extends Phrase {
  compute (input) {
    if (this.props.text == null) return []

    if (input == null) { // pure suggestion
      return [{
        words: [{text: this.props.text, input: false}],
        remaining: null,
        result: this.props.value,
        score: this.props.score || 1
      }]
    }

    const inputLower = input.toLowerCase()
    const thisTextLower = this.props.text.toLowerCase()

    if (_.startsWith(inputLower, thisTextLower)) { // input is partially consumed
      return [{
        words: [{text: this.props.text, input: true}],
        remaining: input.substring(this.props.text.length),
        result: this.props.value,
        score: this.props.score || 1
      }]
    }

    if (_.startsWith(thisTextLower, inputLower)) { // input is entirely consumed
      const words = []
      if (input.length > 0) {
        words.push({text: this.props.text.substring(0, input.length), input: true})
      }
      if (this.props.text.length > input.length) {
        words.push({text: this.props.text.substring(input.length), input: false})
      }

      return [{
        words,
        remaining: null,
        result: this.props.value,
        score: this.props.score || 1
      }]
    }

    if (this.props.fuzzy) { // fuzzy matching
      const result = match(input, this.props.text)
      if (result) {
        result.remaining = ''
        result.result = this.props.value
        result.score = this.props.score || result.score
        return [result]
      }
    }

    return []
  }

  decorate (input) {
    return [{
      words: [{text: this.props.text, input: false}],
      result: this.props.value,
      remaining: input,
      score: 1
    }]
  }

  describe () {
    if (this.props.decorate) {
      return (
        <choice limit={1}>
          <literal {...this.props} decorate={false} />
          <raw function={this.decorate.bind(this)} />
        </choice>
      )
    } else {
      return <raw
        function={this.compute.bind(this)}
        qualifier={this.props.qualifier}
        category={this.props.category} />
    }
  }
}
