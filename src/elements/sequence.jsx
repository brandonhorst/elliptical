/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Sequence extends Phrase {
  describe () {
    // replace optionals with replacements
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

  * _handleParse (input, options) {
    this.childPhrases = reconcile({descriptor: this.props.children, phrase: this.childPhrases, options})

    const modifications = {
      result: {},
      score: 1
    }

    yield* this.parseChild(0, _.assign({}, input, modifications), options)
  }

  * parseChild (childIndex, input, options) {
    if (childIndex >= this.childPhrases.length) {
      yield input
      return
    }

    if (input.suppressIncomplete && _.some(input.words, 'placeholder')) {
      return
    }

    const child = this.childPhrases[childIndex]

    for (let output of parse({phrase: this.childPhrases[childIndex], input, options})) {
      if (this.props.unique && output.result != null && child.props.id && input.result[child.props.id] != null) {
        continue
      }

      const modifications = {}
      modifications.result = getAccumulatedResult(input.result, child, output.result)
      modifications.score = input.score * output.score
      modifications.qualifiers = input.qualifiers.concat(output.qualifiers)
      const nextOutput = _.assign({}, output, modifications)

      yield* this.parseChild(childIndex + 1, nextOutput, options)
    }
  }
}

function getAccumulatedResult (inputResult, child, childResult) {
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
