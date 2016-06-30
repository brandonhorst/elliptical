import _ from 'lodash'

const defaultProps = {
  suppress: true,
  suppressEmpty: true
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
  for (let output of traverse(child, option)) {
    yield output
  }
}

function outputSelf (option, child, props) {
  const word = {
    label: props.label,
    placeholder: true
  }

  const modification = {
    score: 0.01,
    result: undefined,
    text: null,
    words: option.words.concat(word)
  }

  return _.assign({}, option, modification)
}

export default {visit}
