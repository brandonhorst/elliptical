  /** @jsx createElement */
import _ from 'lodash'
import { match } from '../string-match'
import { createElement, Phrase } from 'lacona-phrase'

export class Literal extends Phrase {
  static defaultProps = {
    fuzzy: false
  }

  compute (input) {
    if (this.props.text == null) return []

    const result = match({input, text: this.props.text, fuzzy: this.props.fuzzy})
    return result
  }

  decorate (input) {
    return [{
      words: [{text: this.props.text, input: false}],
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
      return <raw function={this.compute.bind(this)} category={this.props.category} />
    }
  }
}
