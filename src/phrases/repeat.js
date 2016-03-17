import _ from 'lodash'
import traverse from '../traverse'

const defaultProps = {
  max: Number.MAX_SAFE_INTEGER,
  min: 1,
  unique: false
}

function * visit (option, {props, children}) {
  props = _.defaults({}, props, defaultProps)
  const child = children[0]

  const modifications = {
    result: [],
    score: 1
  }

  const trueOption = _.assign({}, option, modifications)
  yield * parseChild(0, trueOption, child, props)
}

function * parseChild (index, option, child, props) {
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
    for (let sepOutput of traverse(option, props.separator)) {
      const trueOutput = _.assign({}, sepOutput, {result: option.result})
      yield * callParseChild(index, trueOutput, child, props)
    }
  } else {
    yield * callParseChild(index, option, child, props)
  }
}

function * callParseChild (index, option, child, props) {
  const mods = {qualifiers: []}
  const trueOption = _.assign({}, option, mods)

  for (let output of traverse(trueOption, child)) {
    if (props.unique &&
        _.some(option.result, _.partial(_.isEqual, _, output.result))) {
      return
    }

    const outputModifications = {
      result: option.result.concat(output.result),
      qualifiers: option.qualifiers.concat(output.qualifiers)
    }

    const trueOutput = _.assign({}, output, outputModifications)
    yield * parseChild(index + 1, trueOutput, child, props)
  }
}

export default {visit}
