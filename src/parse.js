import _ from 'lodash'

export default function *parse({phrase, input, options}) {
  //prevent unbounded recursion. Once we have a completion, do not allow user
  // phrases to continue looping
  if (!_.isEmpty(input.completion) &&
      _.find(input.stack, entry => {
        return entry.Constructor === phrase.constructor &&
          !entry.Constructor.prototype._handleParse
      })) {
    return
  }

  for (let output of parseElement({phrase, input, options})) {
    yield _.assign({}, output, {stack: output.stack.slice(0, -1)}) //pop stack
  }
}

function *parseElement({phrase, input, options}) {
  // add this to the stack before doing anything
  const inputWithStack = _.assign({}, input, {
    stack: input.stack.concat({
      Constructor: phrase.constructor,
      category: phrase.props.category,
      qualifier: phrase.props.qualifier,
      descriptor: phrase.props.descriptor
    }),
    path: input.path.concat(phrase)
  })

  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input: inputWithStack, options})
    for (let output of iterator) {
      if (!phrase.filter || phrase.filter(output.result)) {
        const newOutput = phrase.getValue ?
          _.assign({}, output, {result: phrase.getValue(output.result)}) :
          output

        yield newOutput
      }
    }
  } else if (phrase._handleParse) {
    yield* phrase._handleParse(inputWithStack, options, parse)
  } else {
    //noop
  }

  _.forEach(phrase.__sources, obj => {
    obj.lastVersion = obj.source.__dataVersion
  })
}
