import _ from 'lodash'
import InputOption from '../input-option'
import {Phrase} from 'lacona-phrase'

export default class Repeat extends Phrase {
  constructor(props, Phrase) {
    let child, separator
    if (props.children.length > 0 && props.children[0].Constructor === 'content') {
      child = props.children[0].children[0]
      if (props.children.length > 1 && props.children[1].Constructor === 'separator') {
        separator = props.children[1].children[0]
      }
    } else {
      child = props.children[0]
    }
    this.child = new Phrase(child)
    if (separator) this.separator = new Phrase(separator)
  }

  static get defaultProps() {
    return {
      max: Number.MAX_VALUE,
      min: 0,
      unique: false
    }
  }

  _handleParse(input, options, applyLimit, data, done) {
    var parsesActive = 0

    const parseChild = (input, level) => {
      const childData = (input) => {
        var newInputData = input.getData()
        var newResult = _.clone(input.result)
        var ownResult = input.result[this.props.id] || []
        var childResult = input.result[this.child.element.props.id]
        var newInput
        var continueToSeparator

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (this.props.unique && ownResult.indexOf(childResult) !== -1) {
          return
        }

        // update the results
        if (!_.isUndefined(childResult)) ownResult.push(childResult)
        newResult[this.props.id] = ownResult
        delete newResult[this.child.element.props.id]
        newInputData.result = newResult

        newInput = new InputOption(newInputData)

        // store continueToSeparator, in case the call to data data changes newOption
        continueToSeparator = input.suggestion.length === 0

        // only call data if we are within the min/max repeat range
        if (level >= this.props.min && level <= this.props.max) {
          data(newInput)
        }

        // parse the separator, unless we are above max
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
      this.child.parse(input, options, childData, childDone)
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

      if (this.separator) {
        this.separator.parse(input, options, separatorData, separatorDone)
      } else {
        separatorData(input)
        separatorDone()
      }
    }

    parseChild(input, 1)
  }
}
