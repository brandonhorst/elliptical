/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import {reconcile} from '../reconcile'
import stackFind from '../stackfind'

export default class Placeholder extends Phrase {
  *parseChild (input, options) {
    if (this.props.trigger) this.props.trigger(input.text)

    if (this.props.showForEmpty && input.text === '') return true

    let showPlaceholder = true
    for (let output of parse({phrase: this.childPhrase, input, options})) {
      showPlaceholder = false
      yield output
    }
    if (!showPlaceholder) return false

    if (this.props.displayWhen && this.props.displayWhen(input.text)) {
      return true
    }

    return false
  }

  *yieldSelf(input, options) {
    const category = stackFind(input.stack, 'category', this.props.category, null)
    const descriptors = _.chain(input.stack).map('descriptor').filter().value()

    const word = {
      descriptors,
      // descriptor: this.props.descriptor,
      category,
      input: false,
      placeholder: true
    }

    const modification = {
      score: 1,
      result: undefined,
      text: ''
    }

    if (_.isEmpty(input.suggestion)) {
      modification.suggestion = input.suggestion.concat(word)
    } else {
      modification.completion = input.completion.concat(word)
    }

    yield _.assign({}, input, modification)
  }

  *_handleParse(input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    if (_.isEmpty(input.suggestion)) {
      const showPlaceholder = yield* this.parseChild(input, options)
      if (showPlaceholder) {
        yield* this.yieldSelf(input, options)
      }
    } else {
      yield* this.yieldSelf(input, options)
    }
  }
}
Placeholder.defaultProps = {
  showForEmpty: false,
  displayWhen(input) {
    return input === ''
  }
}
