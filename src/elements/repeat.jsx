import _ from 'lodash'
import reconcile from '../reconcile'

export default {
  reconcile ({props}) {
    if (props.separator) {
      return _.assign({}, props, {separator: reconcile(props.separator)})
    } else {
      return props
    }
  },

  * parse (option, {
    props: {max = Number.MAX_SAFE_INTEGER, min = 1, unique = false, separator},
    children
  }) {
    const child = children[0]

    const modifications = {
      result: [],
      score: 1
    }

    const trueOption = _.assign({}, option, modifications)
    yield* parseChild(0, trueOption, child, min, max, unique, separator)
  }
}

function * parseChild (index, option, child, min, max, unique, separator) {
  if (index > max) {
    return
  }

  if (index >= min) {
    yield option
  }

  if (index >= min && option.text == null) {
    return
  }

  if (index > 0 && separator) {
    for (let sepOutput of separator(option)) {
      const trueOutput = _.assign({}, sepOutput, {result: option.result})
      yield* callParseChild(index, trueOutput, child, min, max, unique, separator)
    }
  } else {
    yield* callParseChild(index, option, child, min, max, unique, separator)
  }
}

function * callParseChild (index, option, child, min, max, unique, separator) {
  const mods = {qualifiers: []}
  const trueOption = _.assign({}, option, mods)

  for (let output of child.traverse(trueOption)) {
    if (unique && _.some(option.result, _.partial(_.isEqual, _, output.result))) {
      return
    }

    const outputModifications = {
      result: option.result.concat(output.result),
      qualifiers: option.qualifiers.concat(output.qualifiers)
    }

    const trueOutput = _.assign({}, output, outputModifications)
    yield* parseChild(index + 1, trueOutput, child, min, max, unique, separator)
  }
}
