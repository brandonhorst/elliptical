import _ from 'lodash'

const defaultProps = {
  suppress: true,
  argument: true,
  suppressEmpty: true,
}

function * visit (option, {props, children}, traverse) {
  props = _.defaults({}, props, defaultProps)
  const child = children[0]

  if (props.suppress && 
    option.text == null ||
    (props.suppressEmpty && option.text === '') ||
    (props.suppressWhen && props.suppressWhen(option.text))
  ) {
    yield outputSelf(option, child, props)
  } else {
    yield * parseChild(option, child, props, traverse)
  }
}

function * parseChild (option, child, props, traverse) {
  let didSetCurrentArgument = false

  const modification = {}
  if (props.argument && !option.currentArgument) {
    modification.currentArgument = props.text
    didSetCurrentArgument = true
  }

  const optionWithArgument = _.assign({}, option, modification)

  for (let output of traverse(child, optionWithArgument)) {
    if (didSetCurrentArgument) {
      yield _.assign({}, output, {currentArgument: undefined})
    } else {
      yield output
    }
  }
}

function outputSelf (option, child, props) {
  const word = {
    text: props.text,
    input: false,
    placeholder: true,
    argument: option.currentArgument ||
      (props.argument ? props.text : undefined)
  }

  const modification = {
    score: 0.01,
    result: undefined,
    text: null
  }

  modification.words = option.words.concat(word)

  return _.assign({}, option, modification)
}

export default {visit}
