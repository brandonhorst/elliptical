import _ from 'lodash'

function hasPlaceholder(output) {
  return _.any(output.words, 'placeholder')
}

function modify (phrase, output) {
  const modifications = {}

  if (phrase.props.ellipsis) {
    modifications.ellipsis = true
  }
  
  if (phrase.props.value) {
    modifications.result = phrase.props.value
  }

  if (phrase.props.qualifiers) {
    modifications.qualifiers = phrase.props.qualifiers
  }

  if (phrase.props.score != null) {
    modifications.score = phrase.props.score
  }

  return _.assign({}, output, modifications)
}

export function * parse ({phrase, input, options}) {
  options.parses++

  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input, options})
    for (let output of iterator) {
      if (!phrase.validate || hasPlaceholder(output) || phrase.validate(output.result)) {
        yield modify(phrase, output)
      }
    }
  } else if (phrase._handleParse) {
    for (let output of phrase._handleParse(input, options)) {
      yield modify(phrase, output)
    }
  } else {
    // noop
  }

  if (phrase.source) {
    phrase.__lastSourceVersion = options.sourceManager.getDataVersion(phrase.source)
  }
}
