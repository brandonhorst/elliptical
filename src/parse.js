import _ from 'lodash'

function hasPlaceholder(output) {
  return _.any(output.words, 'placeholder')
}

function * doParse ({phrase, input, options}) {
  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input, options})
    for (let output of iterator) {
      if (!phrase.validate || hasPlaceholder(output) || phrase.validate(output.result)) {
        yield output
      }
    }
  } else if (phrase._handleParse) {
    yield* phrase._handleParse(input, options)
  } else {
    // noop
  }

  options.sourceManager.markSourceUpToDate(phrase)
}

export function * parse ({phrase, input, options}) {
  for (let output of doParse({phrase, input, options})) {
    const modifications = {}

    if (phrase.props.value) {
      modifications.result = phrase.props.value
    }

    if (phrase.props.qualifier || phrase.props.qualifiers) {
      modifications.qualifiers = phrase.props.qualifiers || [phrase.props.qualifier]
    }

    yield _.assign({}, output, modifications)
  }
}
