/** @jsx createElement */
import _ from 'lodash'
import { Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Tap extends Phrase {
  static defaultProps = {
    function () {}
  };

  * _handleParse (input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    if (input.text != null) {
      options.scheduleParseEndCallback(() => this.props.function(input.text))
    }

    yield* parse({phrase: this.childPhrase, input, options})
  }

  _destroy (destroy) {
    destroy(this.childPhrase)

    delete this.childPhrase
  }

}
