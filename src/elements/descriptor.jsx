/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import {reconcile} from '../reconcile'
import stackFind from '../stackfind'

export default class Descriptor extends Phrase {
  *parseChild (input, options) {
    if (!options.isReparse && this.props.trigger) this.props.trigger(input.text)

    if (this.props.showForEmpty && input.text === '') return true

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

    if (this.props.displayWhen && this.props.displayWhen(input.text)) {
      return true
    }

    return false
  }

  *yieldSelf(input, options) {
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

    // if (_.isEmpty(input.suggestion)) {
    //   modification.suggestion = input.suggestion.concat(word)
    // } else {
    //   modification.completion = input.completion.concat(word)
    // }

    yield _.assign({}, input, modification)
  }

  *_handleParse(input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    let inputWithArgument = input
    if (this.props.argument && !input.currentArgument) {
      inputWithArgument = _.assign({}, input, {currentArgument: this.props.text})
    }

    if (this.props.placeholder) {
      if (input.text !== '' || _.all(input.words, 'input')) {
        const showPlaceholder = yield* this.parseChild(inputWithArgument, options)
        if (showPlaceholder) {
          yield* this.yieldSelf(input, options)
        }
      } else {
        yield* this.yieldSelf(input, options)
      }
    } else {
      yield* this.parseChild(inputWithArgument, options)
    }
  }
}
Descriptor.defaultProps = {
  placeholder: false,
  argument: false,
  showForEmpty: false,
  displayWhen(input) {
    return input === ''
  }
}
