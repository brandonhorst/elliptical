import _ from 'lodash'

function * traverse (option, {
  props: {
    suppress = true,
    argument = true,
    suppressEmpty = true,
    text,
    suppressWhen},
  children,
  next
}) {
  const child = children[0]

  if (suppress && (
    option.text == null ||
    (suppressEmpty && option.text === '') ||
    (suppressWhen && suppressWhen(option.text))
  )) {
    yield outputSelf(option, child, argument, text)
  } else {
    yield * parseChild(option, child, argument, text, next)
  }
}

function * parseChild (option, child, argument, text, next) {
  let didSetCurrentArgument = false

  const modification = {}
  if (argument && !option.currentArgument) {
    modification.currentArgument = text
    didSetCurrentArgument = true
  }

  const optionWithArgument = _.assign({}, option, modification)

  for (let output of next(optionWithArgument, child)) {
    if (didSetCurrentArgument) {
      yield _.assign({}, output, {currentArgument: undefined})
    } else {
      yield output
    }
  }
}

function outputSelf (option, child, argument, text) {
  const word = {
    text: text,
    input: false,
    placeholder: true,
    argument: option.currentArgument || (argument ? text : undefined)
  }

  const modification = {
    score: 0.01,
    result: undefined,
    text: null
  }

  modification.words = option.words.concat(word)

  return _.assign({}, option, modification)
}

export default {traverse}
