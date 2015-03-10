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

  _handleParse(input, options) {
    // if this has a category, use that
    // if not, use the last category on the stack
    let category = this.props.category
    if (_.isUndefined(category)) {
      const stackEntry = input.get('stack').findLast(entry => !_.isUndefined(entry.get('category')))
      category = stackEntry ? stackEntry.get('category') : null
    }

    const handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy,
      category: category
    }

    return _.chain(this.props.compute(input.get('text')))
      .map(({text, value}) => {
        const newInput = handleString(input, text, handleStringOptions)
        if (newInput !== null) {
          return newInput.update('result', result => result.set(this.props.id, value))
        }
      })
      .filter(_.negate(_.isUndefined))
      .value()
  }
}
