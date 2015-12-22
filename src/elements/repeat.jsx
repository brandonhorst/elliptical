import _ from 'lodash'
import { Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Repeat extends Phrase {
  static defaultProps = {
    max: Number.MAX_SAFE_INTEGER,
    min: 1,
    unique: false
  };

  * _handleParse (input, options) {
    this.child = reconcile({descriptor: this.props.children[0], phrase: this.child, options})
    this.separator = this.props.separator ? reconcile({descriptor: this.props.separator, phrase: this.separator, options}) : null

    const modifications = {
      result: [],
      score: 1
    }

    yield* this.parseChild(0, _.assign({}, input, modifications), options)
  }

  * parseChild (childIndex, input, options) {
    if (childIndex > this.props.max) {
      return
    }

    if (childIndex >= this.props.min) {
      yield input
    }

    if (_.some(input.words, 'placeholder')) {
      return
    }

    if (childIndex > 0 && this.separator) {
      for (let sepOutput of parse({phrase: this.separator, input, options})) {
        const trueOutput = _.assign({}, sepOutput, {result: input.result})
        yield* this.callParseChild(childIndex, trueOutput, options)
      }
    } else {
      yield* this.callParseChild(childIndex, input, options)
    }
  }

  * callParseChild (childIndex, input, options) {
    for (let output of parse({phrase: this.child, input, options})) {
      if (this.props.unique && _.some(input.result, _.partial(_.isEqual, _, output.result))) {
        return
      }
      const trueInput = _.assign({}, output, {result: input.result.concat(output.result)})
      yield* this.parseChild(childIndex + 1, trueInput, options)
    }
  }
}
