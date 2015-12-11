/** @jsx createElement */
import { createElement, Phrase } from 'lacona-phrase'

export default class Filter extends Phrase {
  validate (result) {
    return this.props.function(result)
  }

  describe () {
    return this.props.children[0]
  }
}
