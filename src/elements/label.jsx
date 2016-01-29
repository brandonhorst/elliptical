/** @jsx createElement */
import _ from 'lodash'
import { Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Label extends Phrase {
  static defaultProps = {
    suppress: true,
    argument: true,
    suppressEmpty: true,
  };

  * parseChild (input, options) {
    let didSetCurrentArgument = false

    const modification = {}
    if (this.props.argument && !input.currentArgument) {
      modification.currentArgument = this.props.text
      didSetCurrentArgument = true
    }

    const inputWithArgument = _.assign({}, input, modification)

    let didOutputSelf = false

    for (let output of parse({phrase: this.childPhrase, input: inputWithArgument, options})) {
      if (didSetCurrentArgument) {
        yield _.assign({}, output, {currentArgument: undefined})
      } else {
        yield output
      }
    }
  }

  outputSelf (input, options) {
    const word = {
      text: this.props.text,
      input: false,
      placeholder: true,
      argument: input.currentArgument || (this.props.argument ? this.props.text : undefined)
    }

    const modification = {
      score: 0.01,
      result: undefined,
      text: null
    }

    modification.words = input.words.concat(word)

    return _.assign({}, input, modification)
  }

  * _handleParse (input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    if (input.text == null || (
        this.props.suppress && (
          this.props.suppressEmpty && input.text === '' ||
          (this.props.suppressWhen && this.props.suppressWhen(input.text))
        ))) {
      yield this.outputSelf(input, options)
    } else {
      yield* this.parseChild(input, options)
    }
  }
}
