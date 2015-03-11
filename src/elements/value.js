import _ from 'lodash'
import {handleString} from '../input-option'
import {Phrase} from 'lacona-phrase'

export default class Value extends Phrase {
  static getDefaultProps() {
    return {
      join: false,
      fuzzy: 'all'
    }
  }

  *_handleParse(input, options) {
    // if this has a category use that, else the last category on the stack
    let category = this.props.category
    let successfulDataCount = 0
    if (_.isUndefined(category)) {
      const stackEntry = input.get('stack').findLast(entry => !_.isUndefined(entry.get('category')))
      category = stackEntry ? stackEntry.get('category') : null
    }

    const handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy,
      category: category
    }

    let iterator = this.props.compute(input.get('text'))
    for (let suggestion of iterator) {
      if (suggestion) {
        const newInput = handleString(input, suggestion.text, handleStringOptions)
        if (newInput !== null) {
          let completed = yield newInput.update('result', result => result.set(this.props.id, suggestion.value))
          if (completed) successfulDataCount++
          if (this.props.limit && successfulDataCount >= this.props.limit) break
        }
      }
    }
  }
}
