/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import {reconcile} from '../reconcile'

function addSeparator (child, separator) {
  if (child.props && child.props.optional) {
    const newChild = _.merge({}, child, {props: {optional: false}})
    //TODO there are likely some problems with separators and optional
    return <Sequence optional={true} merge={true}>{newChild}{separator}</Sequence>
  } else {
    return <Sequence merge={true}>{child}{separator}</Sequence>
  }
}

export default class Sequence extends Phrase {
  describe() {
    //get the content and the separator
    let content, separator
    if (this.props.children[0] && this.props.children[0].Constructor === 'content') {
      content = this.props.children[0].children
      if (this.props.children[1] && this.props.children[1].Constructor === 'separator') {
        //apply separators
        separator = this.props.children[1].children[0]
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

    //replace optionals with replacements
    if (_.some(this.props.children, _.property('props.optional'))) {
      const newChildren = _.map(this.props.children, child => {
        if (child && child.props && child.props.optional) {

          const newChild = _.merge({}, child, {props: {optional: false}})
          delete newChild.props.id
          delete newChild.props.merge

          const choiceChildren = [<literal text='' />, newChild]

          if (child.props.preferred) choiceChildren.reverse()

          return (
            <choice limit={child.props.limited ? 1 : undefined} id={child.props.id} merge={child.props.merge}>
              {choiceChildren}
            </choice>
          )
        }

        return child
      })

      return <sequence {...this.props} children={undefined}>{newChildren}</sequence>
    }
  }

  *_handleParse(input, options) {
    this.childPhrases = reconcile({descriptor: this.props.children, phrase: this.childPhrases, options})

    yield* this.parseChild(0, _.assign({}, input, {result: {}, score: 1}), options)
  }

  *parseChild(childIndex, input, options) {
    if (childIndex >= this.childPhrases.length) {
      yield input
      return
    }

    const child = this.childPhrases[childIndex]
    let success = false

    for (let output of parse({phrase: this.childPhrases[childIndex], input, options})) {
      const accumulatedResult = this.props.value || getAccumulatedResult(input.result, child, output.result)
      const newScore = input.score *  output.score
      const nextOutput = _.assign({}, output, {
        result: accumulatedResult,
        score: newScore,
        callbacks: output.callbacks.concat(() => success = true)
      })

      yield* this.parseChild(childIndex + 1, nextOutput, options)
    }

    // if (child.props && child.props.optional) {
    //   yield* this.parseChild(childIndex + 1, input, options)
    // }
  }
}

function getAccumulatedResult(inputResult, child, childResult) {
  if (!_.isUndefined(childResult)) {
    const childId = child.props.id
    const childMerge = child.props.merge
    if (childId) {
       return _.assign({}, inputResult, {[childId]: childResult})
    } else if (childMerge) {
      if (_.isPlainObject(childResult)) {
        return _.merge({}, inputResult, childResult)
      } else {
        return childResult
      }
    }
  }
  return inputResult
}
