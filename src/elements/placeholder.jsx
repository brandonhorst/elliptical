/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import {reconcile} from '../reconcile'
import stackFind from '../stackfind'

export default class Placeholder extends Phrase {
  *_handleParse(input, options) {
    this.childPhrase = reconcile({descriptor: this.props.children[0], phrase: this.childPhrase, options})

    if (input.text !== '') {
      yield* parse({phrase: this.childPhrase, input, options})
    } else {
      let success = false
      if (_.isEmpty(input.suggestion)) {
        for (let output of parse({phrase: this.childPhrase, input, options})) {
          success = true
          yield output
        }
      }

      if (!success) {
        const category = stackFind(input.stack, 'category', this.props.category, null)
        const join = stackFind(input.stack, 'join', this.props.join, false)

        const word = {string: this.props.text, category, input: false, placeholder: true}

        const modification = {score: 1}

        if (_.isEmpty(input.suggestion) || (_.isEmpty(input.completion) && join)) {
          modification.suggestion = input.suggestion.concat(word)
        } else {
          modification.completion = input.completion.concat(word)
        }

        yield _.assign({}, input, modification)
      }
    }
  }
}
