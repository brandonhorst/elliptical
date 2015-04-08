/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import stackFind from '../stackfind.js'

export default class Placeholder extends Phrase {
  *_handleParse(input, options) {
    if (input.text === '' && (!_.isEmpty(input.suggestion) || this.props.suggest)) {
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
