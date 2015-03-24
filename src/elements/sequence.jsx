/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import reconcile from '../reconcile'

function addSeparator (child, separator) {
  if (child.props.optional) {
    newChild = _.clone(child)
    newChild.props = _.clone(child.props)
    newChild.props.optional = false
    return <Sequence optional={true} merge={true}>{newChild}{separator}</Sequence>
  } else {
    return <Sequence merge={true}>{child}{separator}</Sequence>
  }
}

export default class Sequence extends Phrase {
  describe() {
    let content, separator
    if (this.props.children.length > 0 && this.props.children[0].Constructor === 'content') {
      content = this.props.children[0].children
      if (this.props.children.length > 1 && this.props.children[1].Constructor === 'separator') {
        separator = this.props.children[1].children[0]
      }
    } else {
      return //no content, we're good to go!
    }

    if (separator) {
      return (
        <sequence {...this.props}>
          {_.chain(content.slice(0, -1))
            .map(_.partial(addSeparator, _, separator))
            .concat(_.last(content))
            .value()
          }
        </sequence>
      )
    } else {
      return <sequence {...this.props}>{content}</sequence>
    }
  }

  *_handleParse(input, options) {
    this.stores = reconcile({descriptor: this.props.children, store: this.stores, options})

    yield* this.parseChild(0, _.assign({}, input, {result: {}}), options)
  }

  *parseChild(childIndex, input, options) {
    // lastText and lastTextSucceeded are a perf optimization.
    //  It is likely that values will send back multiple outputs with the exact
    //  same text in a row. If that is the case, and the next child cannot parse that text,
    //  there is no need to parse the next ones with the same text. It will continue
    //  until getting a new text
    let lastText, lastTextSucceeded

    for (let output of parse({store: this.stores[childIndex], input, options})) {
      if (!lastTextSucceeded && output.text === lastText) continue
      let accumulatedResult = this.props.value ||
        getAccumulatedResult(input.result, this.props.children[childIndex], output.result)
      const nextOutput = _.assign({}, output, {result: accumulatedResult})

      if (childIndex === this.props.children.length - 1) {
        lastTextSucceeded = true
        yield nextOutput
      } else {
        lastTextSucceeded = false
        for (let childOutput of this.parseChild(childIndex + 1, nextOutput, options)) {
          lastTextSucceeded = true
          yield childOutput
        }
      }
      lastText = output.text
    }
  }

}


function getAccumulatedResult(inputResult, child, childResult) {
  if (!_.isUndefined(childResult)) {
    const childId = child.props && child.props.id
    const childMerge = child.props && child.props.merge
    if (childId) {
       return _.merge({}, inputResult, {[childId]: childResult})
    } else if (childMerge) {
      return _.merge({}, inputResult, childResult)
    }
  }
  return inputResult
}
