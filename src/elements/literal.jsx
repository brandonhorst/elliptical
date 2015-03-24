/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'

export default class Literal extends Phrase {
  suggest() {
    return [{suggestion: this.props.text, value: this.props.value}]
  }

  compute(input) {
    if (_.startsWith(input.toLowerCase(), this.props.text.toLowerCase())) {
      return [{
        words: [{text: this.props.text, input: true}],
        remaining: input.substring(this.props.text.length),
        value: this.props.value
      }]
    } else if (_.startsWith(this.props.text.toLowerCase(), input.toLowerCase())) {
      const words = [{text: this.props.text.substring(0, input.length), input: true}]
      if (this.props.text.length > input.length) {
        words.push({text: this.props.text.substring(input.length), input: false})
      }
      return [{words, remaining: '', value: this.props.value}]
    } else {
      return []
    }
  }

  describe() {
    return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} />
  }
}
