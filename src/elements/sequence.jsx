/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { parse } from '../parse'
import { reconcile } from '../reconcile'

export class Sequence extends Phrase {
  * _handleParse (input, options) {
    this.childPhrases = reconcile({descriptor: this.props.children, phrase: this.childPhrases, options})

    const modifications = {
      result: {},
      score: 1
    }

    yield* this.parseChildControl(0, _.assign({}, input, modifications), options)
  }

  * parseChildControl (childIndex, input, options) {
    if (childIndex >= this.childPhrases.length) { // we've reached the end
      yield input
      return
    }

    let trueInput = input

    if (childIndex > 0 && this.childPhrases[childIndex - 1].props.ellipsis) {
      const previousChild = this.childPhrases[childIndex - 1]
      if (trueInput.text === '') {
        if (childIndex <= 1 || !_.includes(trueInput._previousEllipsis, this.childPhrases[childIndex - 2])) {
          yield trueInput
          trueInput = _.assign({}, trueInput, {
            _previousEllipsis: trueInput._previousEllipsis.concat(previousChild)
          })
        }
      } else {
        let success = false
        yield _.assign({}, trueInput, {
          callbacks: trueInput.callbacks.concat(() => success = true)
        })
        if (success) return
      }
    }

    const child = this.childPhrases[childIndex]

    if (child.props.optional) {
      let success = false
      if (child.props.limited) {
        trueInput = _.assign({}, trueInput, {callbacks: trueInput.callbacks.concat(() => success = true)})
      }
      if (child.props.preferred) {
        yield* this.parseChild(childIndex, trueInput, options)
        if (!child.props.limited || !success) {
          yield* this.parseChildControl(childIndex + 1, trueInput, options)
        }
      } else {
        yield* this.parseChildControl(childIndex + 1, trueInput, options)
        if (!child.props.limited || !success) {
          yield* this.parseChild(childIndex, trueInput, options)
        }
      }
    } else {
      yield* this.parseChild(childIndex, trueInput, options)
    }

  }

  * parseChild (childIndex, input, options) {
    const child = this.childPhrases[childIndex]

    for (let output of parse({phrase: child, input, options})) {
      if (this.props.unique && output.result != null) {
        if (child.props.id && input.result[child.props.id] != null) { // id
          continue
        } else if (child.props.merge && !_.isEmpty(_.intersection(_.keys(input.result), _.keys(output.result)))) { // merge
          continue
        }
      }

      const modifications = {
        result: getAccumulatedResult(input.result, child, output.result),
        score: input.score * output.score,
        qualifiers: input.qualifiers.concat(output.qualifiers)
      }

      let nextOutput = _.assign({}, output, modifications)


      yield* this.parseChildControl(childIndex + 1, nextOutput, options)
    }
  }

  _destroy (destroy) {
    _.forEach(this.childPhrases, destroy)

    delete this.childPhrases
  }
}

function getAccumulatedResult (inputResult, child, childResult) {
  if (!_.isUndefined(childResult)) {
    const childId = child.props.id
    const childMerge = child.props.merge
    if (childId) {
      return _.assign({}, inputResult, {[childId]: childResult})
    } else if (childMerge) {
      if (!_.isEmpty(inputResult) && _.isPlainObject(childResult)) {
        return _.merge({}, inputResult, childResult)
      } else {
        return childResult
      }
    }
  }
  return inputResult
}
