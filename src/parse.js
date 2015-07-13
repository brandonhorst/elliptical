import _ from 'lodash'

export default function *parse({phrase, input, options}) {
  yield* parseElement({phrase, input, options})
}

function *parseElement({phrase, input, options}) {
  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input, options})
    for (let output of iterator) {
      if (!phrase.filter || phrase.filter(output.result)) {
        const newOutput = phrase.getValue ?
          _.assign({}, output, {result: phrase.getValue(output.result)}) :
          output

        yield newOutput
      }
    }
  } else if (phrase._handleParse) {
    yield* phrase._handleParse(input, options, parse)
  } else {
    //noop
  }

  _.forEach(phrase.__sources, obj => {
    obj.lastVersion = obj.source.__dataVersion
  })
}
