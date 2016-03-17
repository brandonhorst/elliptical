import _ from 'lodash'
import traverse from '../traverse'
import {limitIterator} from '../utils'

function * visit (option, {props: {unique = false}, children}) {
  const mods = {result: {}, score: 1}
  const trueOption = _.assign({}, option, mods)
  const iterator = parseChildControl(0, trueOption, unique, children)

  yield * iterator
}

function shouldDoEllipsis (index, option, children) {
  // Don't do ellipsis for the first element,
  // or if this element is both optional and ellipsis, and the text is ''
  // because that results in duplicate options output
  const child = children[index]
  return (
    index > 0 &&
    children[index - 1].props.ellipsis &&
    !(
      child.props.ellipsis &&
      child.props.optional &&
      option.text === ''
    )
  )
}

function * parseOptionals (index, option, unique, children) {
  const child = children[index]

  const withChildParse = parseChild(index, option, unique, children)
  const withoutChildParse = parseChildControl(index + 1, option, unique, children)

  if (child.props.preferred) {
    yield * withChildParse
    yield * withoutChildParse
  } else {
    yield * withoutChildParse
    yield * withChildParse
  }
}

function * parseChildControl (index, option, unique, children) {
  if (index >= children.length) { // we've reached the end
    yield option
    return
  }

  const child = children[index]

  if (shouldDoEllipsis(index, option, children)) {
    if (option.text === '') {
      yield option
    } else {
      let success = false
      yield _.assign({}, option, {
        callbacks: option.callbacks.concat(() => { success = true })
      })
      if (success) return
    }
  }

  if (child.props.optional) {
    const optionals = parseOptionals(index, option, unique, children)
    yield * limitIterator(optionals, child.props.limited ? 1 : undefined)
  } else {
    yield * parseChild(index, option, unique, children)
  }
}

function hasSomeSameKeys(option, output) {
  const sameKeys = _.intersection(_.keys(option.result), _.keys(output.result))
  return !_.isEmpty(sameKeys)
}

function * parseChild (index, option, unique, children) {
  const child = children[index]

  for (let output of traverse(option, child)) {
    if (unique && output.result != null) {
      if (child.props.id && option.result[child.props.id] != null) {
        continue
      } else if (child.props.merge && hasSomeSameKeys(option, output)) {
        continue
      }
    }

    const modifications = {
      result: getAccumulatedResult(option.result, child, output.result),
      score: option.score * output.score,
      qualifiers: option.qualifiers.concat(output.qualifiers)
    }

    let nextOutput = _.assign({}, output, modifications)

    yield * parseChildControl(index + 1, nextOutput, unique, children)
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

export default {visit}
