import _ from 'lodash'
import asyncEach from 'async-each'
import InputOption from '../input-option'
import {Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  constructor(props, Phrase) {
    this.children = _.map(props.children, child => new Phrase(child))
  }

  _handleParse(input, options, applyLimit, data, done) {
    const eachChild = (child, done) => {
      const childData = (input) => {
        var inputData = input.getData()
        inputData.result[this.props.id] = input.result[child.element.props.id]
        data(new InputOption(inputData))
      }

      // parse the child
      var newInput = input
      var inputData
      if (this.props.limit) {
        inputData = input.getData()
        inputData.limit = applyLimit(input)
        newInput = new InputOption(inputData)
      }
      child.parse(newInput, options, childData, done)
    }

    // Parse each child asyncronously
    asyncEach(this.children, eachChild, done)
  }
}
