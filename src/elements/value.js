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

  _handleParse(input, options, applyLimit, data, done) {
    var handleStringOptions = {
      join: this.props.join,
      fuzzy: this.props.fuzzy
    }

    const computeData = (suggestion) => {
      // if this has a category, use that
      // if not, use the last category on the stack
      handleStringOptions.category = this.props.category
      if (!handleStringOptions.category) {
        //TODO HORRIBLY INEFFECIENT
        const stackEntry = _.findLast(input.get('stack').toJS(), 'category')
        handleStringOptions.category = stackEntry ? stackEntry.category : null
      }

      const newInput = handleString(input, suggestion.text, handleStringOptions)
      if (newInput !== null) {
        const resultInput = newInput.update('result', result => result.set(this.props.id, suggestion.value))
        // newResult = _.clone(input.result)
        // newResult[this.props.id] = suggestion.value
        // newInput.result = newResult
        if (this.props.limit) {
          data(applyLimit(resultInput))
        } else {
          data(resultInput)
        }
      }
    }

    return this.props.compute(input.text, computeData, done)
  }
}
