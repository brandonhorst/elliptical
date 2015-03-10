import _ from 'lodash'
import I from 'immutable'
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

  _handleParse(input, options) {
    const outputs = []

    const parseChild = (input, level) => {
      this.child.parse(input, options).forEach(output => {
        var ownResult = output.get('result').get(this.props.id) || I.List()
        var childResult = output.get('result').get(this.child.element.props.id)

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (this.props.unique && ownResult.contains(childResult)) return

        const newOwnResult = ownResult.push(childResult)
        const newOutput = output.update('result', result => result
          .set(this.props.id, newOwnResult)
          .delete(this.child.element.props.id)
        )

        // only call data if we are within the min/max repeat range
        if (level >= this.props.min && level <= this.props.max) {
          outputs.push(newOutput)
        }

        // parse the separator, unless we are above max or there is a suggestion
        if (level < this.props.max && output.get('suggestion').count() === 0) {
          parseSeparator(newOutput, level)
        }
      })
    }

    const parseSeparator = (input, level) => {
      if (this.separator) {
        this.separator.parse(input, options).forEach(output => parseChild(output, level + 1))
      } else {
        parseChild(input, level + 1)
      }
    }

    parseChild(input, 1)

    return outputs
  }
}
