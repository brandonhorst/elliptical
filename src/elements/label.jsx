/** @jsx createElement */
import _ from 'lodash'
import { Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Label extends Phrase {
  static defaultProps = {
    suppress: true,
    argument: true,
    suppressEmpty: false,
    suppressWhen (input) { return false }
  };

  * parseChild (input, options) {

    let showPlaceholder = true
    for (let output of parse({phrase: this.childPhrase, input, options})) {
      showPlaceholder = false
      if (this.props.argument) {
        yield _.assign({}, output, {currentArgument: undefined})
      } else {
        yield output
      }
    }
    if (!showPlaceholder) return false


    return false
  }

  * yieldSelf (input, options) {
    const word = {
      text: this.props.text,
      input: false,
      placeholder: true,
      argument: input.currentArgument
    }

    const modification = {
      score: 0.01,
      result: undefined,
      text: ''
    }

    modification.words = input.words.concat(word)

    yield _.assign({}, input, modification)
  }

  * _handleParse (input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    let inputWithArgument = input
    if (this.props.argument && !input.currentArgument) {
      inputWithArgument = _.assign({}, input, {currentArgument: this.props.text})
    }

    if (input.text == null || (
        this.props.suppress && (
          this.props.suppressEmpty && input.text === '' ||
          this.props.suppressWhen(input.text)
        ))) {
      yield* this.yieldSelf(inputWithArgument, options)
    } else {
      yield* this.parseChild(inputWithArgument, options)
    }
  }
}
