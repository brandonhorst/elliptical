import _ from 'lodash'

function * traverse (option, {
  props: {max = Number.MAX_SAFE_INTEGER, min = 1, unique = false, separator},
  children,
  next
}) {
  const child = children[0]

  const modifications = {
    result: [],
    score: 1
  }
  const props = {max, min, unique, separator}

  const trueOption = _.assign({}, option, modifications)
  yield * parseChild(0, trueOption, child, props, next)
}

function * parseChild (index, option, child, props, next) {
  if (index > props.max) {
    return
  }

  if (index >= props.min) {
    yield option
  }

  if (index >= props.min && option.text == null) {
    return
  }

  if (index > 0 && props.separator) {
    for (let sepOutput of next(option, props.separator)) {
      const trueOutput = _.assign({}, sepOutput, {result: option.result})
      yield * callParseChild(index, trueOutput, child, props, next)
    }
  } else {
    yield * callParseChild(index, option, child, props, next)
  }
}

function * callParseChild (index, option, child, props, next) {
  const mods = {qualifiers: []}
  const trueOption = _.assign({}, option, mods)

  for (let output of next(trueOption, child)) {
    if (props.unique &&
        _.some(option.result, _.partial(_.isEqual, _, output.result))) {
      return
    }

    const outputModifications = {
      result: option.result.concat(output.result),
      qualifiers: option.qualifiers.concat(output.qualifiers)
    }

    const trueOutput = _.assign({}, output, outputModifications)
    yield * parseChild(index + 1, trueOutput, child, props, next)
  }
}

export default {traverse}
