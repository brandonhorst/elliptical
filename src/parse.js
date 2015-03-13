import _ from 'lodash'
import I from 'immutable'

export default function *parse({store, input, options}) {
  //prevent unbounded recursion. Once we have a completion, do not allow user
  // phrases to continue looping
  if (!input.get('suggestion').isEmpty() &&
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
    const inputWithoutResult = inputWithStack.set('result', I.Map())

    const iterator = parse({store: store.describedStore, input: inputWithoutResult, options})
    for (let output of iterator) {
      const newResult = store.phrase.getValue ?
        I.fromJS(store.phrase.getValue(output.get('result').toJS())) :
        output.get('result')
      const cleared = clearTemps(newResult)

      yield output.set('result', input.get('result').set(store.props.id, cleared))
    }
  } else {
    yield* store.phrase._handleParse(inputWithStack, options, parse)
  }
}

function clearTemps(result) {
  if (I.Map.isMap(result)) {
    return result.filter((value, key) => !_.startsWith(key, '_temp') && !_.isUndefined(value))
  } else if (I.List.isList(result)) {
    return result.filter(_.isUndefined)
  } else {
    return result
  }
}
