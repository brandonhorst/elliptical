/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Tap extends Phrase {
  *_handleParse(input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    if (input.text != null) {
      this.props.function(input.text)
    }

    yield* parse({phrase: this.childPhrase, input, options})
  }
}

Tap.defaultProps = {
  function() {}
}
