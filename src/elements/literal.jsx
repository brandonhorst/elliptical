/** @jsx createElement */
import {createElement} from '../create-element'
import value from './value'

export default class Literal {
  computeLiteral(inputString, data, done) {
    data({
      text: this.props.text,
      value: this.props.value
    })
    return done()
  }

  getValue(result) {
    return result.literal
  }

  describe() {
    return <value id='literal' compute={this.computeLiteral.bind(this)}
      category={this.props.category} join={this.props.join} />
  }
}
