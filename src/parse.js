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

  let trueInput = input
  if (phrase.props.__sentence) {
    trueInput = _.assign({}, input, {sentence: phrase})
  }

  for (let output of parseElement({phrase, input: trueInput, options})) {
    yield _.assign({}, output, {stack: output.stack.slice(0, -1)}) //pop stack
  }
}

function *parseElement({phrase, input, options}) {
  // add this to the stack before doing anything
  const inputWithStack = _.assign({}, input, {stack: input.stack.concat({
    Constructor: phrase.constructor,
    category: phrase.props.category,
    join: phrase.props.join
  })})

  if (phrase.__describedPhrase) {
    const iterator = parse({phrase: phrase.__describedPhrase, input: inputWithStack, options})
    for (let output of iterator) {
      if (!phrase.filter || phrase.filter(output.result)) {
        const newResult = phrase.getValue ?
          phrase.getValue(output.result) :
          output.result

        yield _.assign({}, output, {result: newResult})
      }
    }
  } else {
    yield* phrase._handleParse(inputWithStack, options, parse)
  }

  _.forEach(phrase.__sources, obj => {
    obj.lastVersion = obj.source.__dataVersion
  })
}
