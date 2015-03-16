import _ from 'lodash'
import I from 'immutable'

export default function *parse({store, input, options}) {
  //prevent unbounded recursion. Once we have a completion, do not allow user
  // phrases to continue looping
  if (!input.get('completion').isEmpty() &&
      input.get('stack').find(entry => {
        const Constructor = entry.get('Constructor')
        return Constructor === store.Constructor && !Constructor.prototype._handleParse
      })) {
    return
  }

  let trueInput = input
  if (store.props.__sentence) {
    trueInput = trueInput.set('sentence', store.phrase)
  }

  if (store.props.optional) {
    yield input
  }

  for (let output of parseElement({store, input: trueInput, options})) {
    yield output.update('stack', stack => stack.pop())
  }
}

function *parseElement({store, input, options}) {
  // add this to the stack before doing anything
  const inputWithStack = input.update('stack', stack => stack.push(I.Map({
    Constructor: store.Constructor,
    category: store.props.category
  })))

  if (store.describedStore) {
    const iterator = parse({store: store.describedStore, input: inputWithStack, options})
    for (let output of iterator) {
      if (!store.phrase.filter || store.phrase.filter(output.get('result'))) {
        const newResult = store.phrase.getValue ?
          store.phrase.getValue(output.get('result')) :
          output.get('result')

        yield output.set('result', newResult)
      }
    }
  } else {
    yield* store.phrase._handleParse(inputWithStack, options, parse)
  }
}
