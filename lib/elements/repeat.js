var _ = require('lodash')
var createPhrase = require('../create-phrase')
var InputOption = require('../input-option')

module.exports = createPhrase({
  name: 'repeat',
  getDefaultProps: function () {
    return {
      max: Number.MAX_VALUE,
      min: 0,
      unique: false
    }
  },
  _handleParse: function (input, options, applyLimit, data, done) {
    var parsesActive = 0
    var self = this

    function parseChild (input, level) {
      function childData (input) {
        var newInputData = input.getData()
        var newResult = _.clone(input.result)
        var ownResult = input.result[self.props.id] || []
        var childResult = input.result[self.props.child.props.id]
        var newInput
        var continueToSeparator

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (self.props.unique && ownResult.indexOf(childResult) !== -1) {
          return
        }

        if (typeof childResult !== 'undefined') {
          ownResult.push(childResult)
        }

        // set this repeat's result to the new ownResult
        newResult[self.props.id] = ownResult

        // clear out the child's result
        delete newResult[self.props.child.props.id]

        newInputData.result = newResult

        newInput = new InputOption(newInputData)

        // store continueToSeparator, in case the call to data data changes newOption
        continueToSeparator = input.suggestion.length === 0

        // only call data if we are within the min/max repeat range
        if (level >= self.props.min && level <= self.props.max) {
          data(newInput)
        }

        // parse the separator
        if (level < self.props.max && continueToSeparator) {
          parseSeparator(newInput, level)
        }
      }

      function childDone (err) {
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
      self.props.child.parse(input, options, childData, childDone)
    }

    function parseSeparator (input, level) {
      function separatorData (option) {
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

      if (self.props.separator) {
        self.props.separator.parse(input, options, separatorData, separatorDone)
      } else {
        separatorData(input)
        separatorDone()
      }
    }

    parseChild(input, 1)
  }
})
