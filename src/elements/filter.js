/** @jsx createElement */
import { Phrase } from 'lacona-phrase'

export class Filter extends Phrase {
  validate (result) {
    return this.props.function(result)
  }

  describe () {
    return this.props.children[0]
  }
}
