import _ from 'lodash'

export default function *parse({store, input, options}) {
  //prevent unbounded recursion. Once we have a completion, do not allow user
  // phrases to continue looping
  if (!_.isEmpty(input.completion) &&
      _.find(input.stack, entry => {
        return entry.Constructor === store.Constructor &&
          !entry.Constructor.prototype._handleParse
      })) {
    return
  }

  let trueInput = input
  if (store.props.__sentence) {
    trueInput = _.assign({}, input, {sentence: store.phrase})
  }

  for (let output of parseElement({store, input: trueInput, options})) {
    yield _.assign({}, output, {stack: output.stack.slice(0, -1)}) //pop stack
  }
}

function *parseElement({store, input, options}) {
  // add this to the stack before doing anything
  const inputWithStack = _.assign({}, input, {stack: input.stack.concat({
    Constructor: store.Constructor,
    category: store.props.category,
    join: store.props.join
  })})

  if (store.describedStore) {
    const iterator = parse({store: store.describedStore, input: inputWithStack, options})
    for (let output of iterator) {
      if (!store.phrase.filter || store.phrase.filter(output.result)) {
        const newResult = store.phrase.getValue ?
          store.phrase.getValue(output.result) :
          output.result

        yield _.assign({}, output, {result: newResult})
      }
    }
  } else {
    yield* store.phrase._handleParse(inputWithStack, options, parse)
  }
}
