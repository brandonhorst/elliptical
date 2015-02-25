import _ from 'lodash'
import InputOption from '../input-option'

export default class Value {
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
      var stackEntry
      var newInput, newResult

      // if this has a category, use that
      // if not, use the last category on the stack
      handleStringOptions.category = this.props.category
      if (!handleStringOptions.category) {
        stackEntry = _.findLast(input.stack, 'category')
        handleStringOptions.category = stackEntry ? stackEntry.category : null
      }

      newInput = input.handleString(suggestion.text, handleStringOptions)
      if (newInput !== null) {
        newResult = _.clone(input.result)
        newResult[this.props.id] = suggestion.value
        newInput.result = newResult
        if (this.props.limit) {
          newInput.limit = applyLimit(input)
        }
        data(new InputOption(newInput))
      }
    }

    return this.props.compute(input.text, computeData, done)
  }
}
