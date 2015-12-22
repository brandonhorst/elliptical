export function * parse ({phrase, input, options}) {
  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input, options})
    for (let output of iterator) {
      if (!phrase.validate || phrase.validate(output.result)) {
        yield output
      }
    }
  } else if (phrase._handleParse) {
    yield* phrase._handleParse(input, options, parse)
  } else {
    // noop
  }

  options.sourceManager.markSourceUpToDate(phrase)
}
