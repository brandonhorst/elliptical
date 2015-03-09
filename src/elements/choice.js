import _ from 'lodash'
import asyncEach from 'async-each'
import {Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  constructor(props, Phrase) {
    this.children = _.map(props.children, child => new Phrase(child))
  }

  getValue(results) {
    console.log(results)
    return results
  }

  _handleParse(input, options, applyLimit, data, done) {
    const eachChild = (child, done) => {
      const childData = (input) => {
        data(input.update('result', result => result.set(this.props.id, result.get(child.element.props.id))))
        // var inputData = input.getData()
        // inputData.result[this.props.id] = input.result[child.element.props.id]
        // data(new InputOption(inputData))
      }

      // parse the child
      const newInput = this.props.limit ? applyLimit(input) : input
      // var inputData
      // if (this.props.limit) {
      //   inputData = input.getData()
      //   inputData.limit = applyLimit(input)
      //   newInput = new InputOption(inputData)
      // }
      child.parse(newInput, options, childData, done)
    }

    // Parse each child asyncronously
    asyncEach(this.children, eachChild, done)
  }
}
