import _ from 'lodash'

function * traverse (option, {props: {unique = false}, children, next}) {
  const mods = {result: {}, score: 1}
  const trueOption = _.assign({}, option, mods)
  const iterator = parseChildControl(0, trueOption, unique, children, next)

  yield * iterator
}

function shouldDoEllipsis (index, option, children) {
  // Don't do ellipsis for the first element,
  // or if this element is both optional and ellipsis, and the text is ''
  // because that results in duplicate options output
  const child = children[index]
  return (
    index > 0 &&
    children[index - 1].attributes.ellipsis &&
    !(
      child.attributes.ellipsis &&
      child.attributes.optional &&
      option.text === ''
    )
  )
}

function * parseChildControl (index, option, unique, children, next) {
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

  if (child.attributes.optional) {
    let success = false
    if (child.attributes.limited) {
      option = _.assign({}, option, {
        callbacks: option.callbacks.concat(() => { success = true })
      })
    }
    if (child.attributes.preferred) {
      yield * parseChild(index, option, unique, children, next)
      if (!child.attributes.limited || !success) {
        yield * parseChildControl(index + 1, option, unique, children, next)
      }
    } else {
      yield * parseChildControl(index + 1, option, unique, children, next)
      if (!child.attributes.limited || !success) {
        yield * parseChild(index, option, unique, children, next)
      }
    }
  } else {
    yield * parseChild(index, option, unique, children, next)
  }
}

function hasSomeSameKeys(option, output) {
  const sameKeys = _.intersection(_.keys(option.result), _.keys(output.result))
  return !_.isEmpty(sameKeys)
}

function * parseChild (index, option, unique, children, next) {
  const child = children[index]

  for (let output of next(option, child)) {
    if (unique && output.result != null) {
      if (child.attributes.id && option.result[child.attributes.id] != null) {
        continue
      } else if (child.attributes.merge && hasSomeSameKeys(option, output)) {
        continue
      }
    }

    const modifications = {
      result: getAccumulatedResult(option.result, child, output.result),
      score: option.score * output.score,
      qualifiers: option.qualifiers.concat(output.qualifiers)
    }

    let nextOutput = _.assign({}, output, modifications)

    yield * parseChildControl(index + 1, nextOutput, unique, children, next)
  }
}

function getAccumulatedResult (inputResult, child, childResult) {
  if (!_.isUndefined(childResult)) {
    const childId = child.attributes.id
    const childMerge = child.attributes.merge
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

export default {traverse}
