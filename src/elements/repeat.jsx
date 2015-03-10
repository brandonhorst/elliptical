/** @jsx createElement */
import _ from 'lodash'
import I from 'immutable'
import {createElement, Phrase} from 'lacona-phrase'

export default class Repeat extends Phrase {
  // constructor(props, Phrase) {
  //   this.child = new Phrase(child)
  //   if (separator) this.separator = new Phrase(separator)
  // }

  static get defaultProps() {
    return {
      max: Number.MAX_SAFE_INTEGER,
      min: 0,
      unique: false
    }
  }

  describe() {
    if (this.props.children.length <= 2 && this.props.children[0].Constructor !== 'content') {
      return
    }

    let child, separator
    if (this.props.children.length > 0 && this.props.children[0].Constructor === 'content') {
      let child = this.props.children[0].children[0]
      if (this.props.children.length > 1 && this.props.children[1].Constructor === 'separator') {
        return <repeat {...this.props}>{child}{this.props.children[1].children[0]}</repeat>
      }
    } else {
      return <repeat {...this.props}>{this.props.children[0]}</repeat>
    }
  }

  _handleParse(input, options, parse) {
    const outputs = []
    const child = this.props.children[0]
    const separator = this.props.children[1]

    const parseChild = (input, level) => {
      parse(child, input, options).forEach(output => {
        var ownResult = output.get('result').get(this.props.id) || I.List()
        var childResult = output.get('result').get(child.props.id)

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (this.props.unique && ownResult.contains(childResult)) return

        const newOwnResult = ownResult.push(childResult)
        const newOutput = output.update('result', result => result
          .set(this.props.id, newOwnResult)
          .delete(child.props.id)
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
      if (separator) {
        parse(separator, input, options).forEach(output => parseChild(output, level + 1))
      } else {
        parseChild(input, level + 1)
      }
    }

    parseChild(input, 1)

    return outputs
  }
}
