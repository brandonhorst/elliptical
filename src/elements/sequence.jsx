import _ from 'lodash'

function * parse (option, {
  props: {unique = false, value},
  children
}) {
  const mods = {result: {}, score: 1}
  const trueOption = _.assign({}, option, mods)
  const iterator = parseChildControl(0, trueOption, unique, children);

  yield* iterator
}

function * parseChildControl (index, option, unique, children) {
  if (index >= children.length) { // we've reached the end
    yield option
    return
  }

  let trueOption = option
  if (index > 0 && children[index - 1].attributes.ellipsis) {
    const previousChild = children[index - 1]
    if (trueOption.text === '') {
      if (index <= 1 || !_.includes(trueOption._previousEllipsis, children[index - 2])) {
        yield trueOption
        trueOption = _.assign({}, trueOption, {
          _previousEllipsis: trueOption._previousEllipsis.concat(previousChild)
        })
      }
    } else {
      let success = false
      yield _.assign({}, trueOption, {
        callbacks: trueOption.callbacks.concat(() => success = true)
      })
      if (success) return
    }
  }

  const child = children[index]

  if (child.attributes.optional) {
    let success = false
    if (child.attributes.limited) {
      trueOption = _.assign({}, trueOption, {callbacks: trueOption.callbacks.concat(() => success = true)})
    }
    if (child.attributes.preferred) {
      yield* parseChild(index, trueOption, unique, children)
      if (!child.attributes.limited || !success) {
        yield* parseChildControl(index + 1, trueOption, unique, children)
      }
    } else {
      yield* parseChildControl(index + 1, trueOption, unique, children)
      if (!child.attributes.limited || !success) {
        yield* parseChild(index, trueOption, unique, children)
      }
    }
  } else {
    yield* parseChild(index, trueOption, unique, children)
  }

}

function * parseChild (index, option, unique, children) {
  const child = children[index]

  for (let output of child.traverse(option)) {
    if (unique && output.result != null) {
      if (child.attributes.id && option.result[child.attributes.id] != null) { // id
        continue
      } else if (child.attributes.merge && !_.isEmpty(_.intersection(_.keys(option.result), _.keys(output.result)))) { // merge
        continue
      }
    }

    const modifications = {
      result: getAccumulatedResult(option.result, child, output.result),
      score: option.score * output.score,
      qualifiers: option.qualifiers.concat(output.qualifiers)
    }

    let nextOutput = _.assign({}, output, modifications)

    yield* parseChildControl(index + 1, nextOutput, unique, children)
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

export default {parse}