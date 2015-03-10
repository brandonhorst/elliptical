/** @jsx createElement */
import {createElement, Phrase} from 'lacona-phrase'
import value from './value'

export default class Literal extends Phrase {
  computeLiteral(inputString) {
    return [{
      text: this.props.text,
      value: this.props.value
    }]
  }

  getValue(result) {
    return result.literal
  }

  describe() {
    return <value id='literal' compute={this.computeLiteral.bind(this)}
      category={this.props.category} join={this.props.join} />
  }
}
