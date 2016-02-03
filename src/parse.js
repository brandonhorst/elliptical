import _ from 'lodash'
import { reconcile } from './reconcile'

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

  let potentialDescribedPhrase

  if (input.text && phrase.fetch) {
    if (!phrase.__fetchDescribedPhrases[input.text] || options.sourceManager.fetchSourceChanged(phrase, input.text)) {
      options.sourceManager.fetchSourceInstance(phrase, input.text)

      const potentialSource = phrase.__fetchSources[input.text].source
      if (potentialSource) {
        const descriptor = phrase.describe(potentialSource.data)
        phrase.__fetchDescribedPhrases[input.text] = reconcile({descriptor, phrase, options})
      }
    }
    potentialDescribedPhrase = phrase.__fetchDescribedPhrases[input.text]
  } else {
    potentialDescribedPhrase = phrase.__describedPhrase
  }

  if (potentialDescribedPhrase) {
    const iterator = parse({phrase: potentialDescribedPhrase, input, options})
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

  options.sourceManager.markSourceUpToDate(phrase)
}
