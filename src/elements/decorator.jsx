/** @jsx createElement */
import _ from 'lodash'
import {match} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'

class TrueDecorator extends Phrase {
  _handleParse(input, options) {
    // const category = stackFind(input.stack, 'category', this.props.category, null)
    // const qualifier = stackFind(input.stack, 'qualifier', this.props.qualifier, null)
    // const descriptors = _.chain(input.stack).map('descriptor').filter().value(
  }

}

export default class Decorator extends Phrase {
  compute(input) {
    return [{
      words: [{text: this.props.text, input: false}],
      value: this.props.value,
      remaining: input,
      score: 1,
      decorator: true
    }]
  }

  describe() {
    return (
      <choice limit={1}>
        <literal text={this.props.text} value={this.props.value} />
        <value compute={this.compute.bind(this)} />
      </choice>
    )
  }
}
