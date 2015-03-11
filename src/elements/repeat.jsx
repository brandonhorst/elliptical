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

  *_handleParse(input, options, parse) {
    const child = this.props.children[0]
    const separator = this.props.children[1]
    var self = this

    function *parseChild (input, level) {
      const iterator = parse(child, input, options)
      let lastRun = false
      while (true) {
        let {value, done} = iterator.next(lastRun)
        if (done) break

        var ownResult = value.get('result').get(self.props.id) || I.List()
        var childResult = value.get('result').get(child.props.id)

        // if the repeat is unique and the childResult already exists in the result,
        // just stop - we will not do this branch
        if (self.props.unique && ownResult.contains(childResult)) break

        const newOwnResult = ownResult.push(childResult)
        const newOutput = value.update('result', result => result
          .set(self.props.id, newOwnResult)
          .delete(child.props.id)
        )

        // only call data if we are within the min/max repeat range
        if (level >= self.props.min && level <= self.props.max) {
          lastRun = yield newOutput
        }

        // parse the separator, unless we are above max or there is a suggestion
        if (level < self.props.max && value.get('suggestion').count() === 0) {
          const sepIterator = parseSeparator(newOutput, level)
          let lastRun = false
          while (true) {
            let {value, done} = sepIterator.next(lastRun)
            if (done) break

            lastRun = yield value
          }
        }
      }
    }

    function *parseSeparator (input, level) {
      if (separator) {
        for (let output of parse(separator, input, options)) {
          yield* parseChild(output, level + 1)
        }
      } else {
        yield* parseChild(input, level + 1)
      }
    }

    yield* parseChild(input, 1)
  }
}
