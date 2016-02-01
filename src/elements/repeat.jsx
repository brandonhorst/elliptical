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

    const trueInput = _.assign({}, input, modifications)

    yield* this.parseChild(0, trueInput, options)
  }

  * parseChild (childIndex, input, options) {
    if (childIndex > this.props.max) {
      return
    }

    if (childIndex >= this.props.min) {
      if (childIndex < this.props.max) {
        yield _.assign({}, input, {ellipsis: true})
      } else {
        yield input
      }
    }

    if (childIndex >= this.props.min && input.text == null) {
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
    const inputModifications = {qualifiers: []}
    const trueInput = _.assign({}, input, inputModifications)

    for (let output of parse({phrase: this.child, input: trueInput, options})) {
      if (this.props.unique && _.some(input.result, _.partial(_.isEqual, _, output.result))) {
        return
      }

      const outputModifications = {
        result: input.result.concat(output.result),
        qualifiers: input.qualifiers.concat(output.qualifiers)
      }

      const trueOutput = _.assign({}, output, outputModifications)
      yield* this.parseChild(childIndex + 1, trueOutput, options)
    }
  }
}
