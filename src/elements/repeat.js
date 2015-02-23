import _ from 'lodash'
import createPhrase from '../create-phrase'
import InputOption from '../input-option'

export default createPhrase({
  name: 'repeat',
  getDefaultProps() {
    return {
      max: Number.MAX_VALUE,
      min: 0,
      unique: false
    }
  },
  _handleParse(input, options, applyLimit, data, done) {
    var parsesActive = 0

    const parseChild = (input, level) => {
      const childData = (input) => {
        var newInputData = input.getData()
        var newResult = _.clone(input.result)
        var ownResult = input.result[this.props.id] || []
        var childResult = input.result[this.props.child.props.id]
        var newInput
        var continueToSeparator

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (this.props.unique && ownResult.indexOf(childResult) !== -1) {
          return
        }

        if (typeof childResult !== 'undefined') {
          ownResult.push(childResult)
        }

        // set this repeat's result to the new ownResult
        newResult[this.props.id] = ownResult

        // clear out the child's result
        delete newResult[this.props.child.props.id]

        newInputData.result = newResult

        newInput = new InputOption(newInputData)

        // store continueToSeparator, in case the call to data data changes newOption
        continueToSeparator = input.suggestion.length === 0

        // only call data if we are within the min/max repeat range
        if (level >= this.props.min && level <= this.props.max) {
          data(newInput)
        }

        // parse the separator
        if (level < this.props.max && continueToSeparator) {
          parseSeparator(newInput, level)
        }
      }

      const childDone = (err) => {
        if (err) {
          done(err)
        } else {
          parsesActive--
          if (parsesActive === 0) {
            done()
          }
        }
      }

      parsesActive++
      this.props.child.parse(input, options, childData, childDone)
    }

    const parseSeparator = (input, level) => {
      const separatorData = (option) => {
        parseChild(option, level + 1)
      }

      function separatorDone (err) {
        if (err) {
          done(err)
        } else {
          parsesActive--
          if (parsesActive === 0) {
            done()
          }
        }
      }

      if (this.props.separator) {
        this.props.separator.parse(input, options, separatorData, separatorDone)
      } else {
        separatorData(input)
        separatorDone()
      }
    }

    parseChild(input, 1)
  }
})
