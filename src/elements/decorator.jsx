/** @jsx createElement */
import {createElement, Phrase} from 'lacona-phrase'
//
// class TrueDecorator extends Phrase {
//   _handleParse(input, options) {
//     // const category = stackFind(input.stack, 'category', this.props.category, null)
//     // const qualifier = stackFind(input.stack, 'qualifier', this.props.qualifier, null)
//     // const descriptors = _.chain(input.stack).map('descriptor').filter().value(
//   }
//
// }

export default class Decorator extends Phrase {
  compute (input) {
    return [{
      words: [{text: this.props.text, input: false, decorator: true}],
      value: this.props.value,
      remaining: input,
      score: 1
    }]
  }

  describe () {
    if (!this.props.allowInput) {
      return <value compute={this.compute.bind(this)} />
    } else {
      return (
        <choice limit={1}>
          <literal text={this.props.text} value={this.props.value} />
          <value compute={this.compute.bind(this)} />
        </choice>
      )
    }
  }
}

Decorator.defaultProps = {
  allowInput: true
}
