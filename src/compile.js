import _ from 'lodash'
import {isComplete} from './utils'
import * as phrases from './phrases'
import createOption from './option'

function applyDefaults (element) {
  return _.assign({}, element, {
    props: _.defaults({}, element.props, element.type.defaultProps || {})
  })
}

function compileAndAddToMap (subElement, process, elementMap, {errors}) {
  const traverse = compileNonRoot(subElement, process, {errors})

  elementMap.set(subElement, traverse)

  return traverse
}

function next (elementMap, process, subElement, option, {errors}) {
  let traverser = elementMap.get(subElement)
  if (traverser) {
    return traverser(option)
  } else {
    const newTraverser = compileAndAddToMap(subElement, process, elementMap, {errors})
    return newTraverser(option)
  }
}

function compileProp (prop, process, elementMap, {errors}) {
  if (prop && prop.type && prop.props && prop.children &&
      (_.isPlainObject(prop.type) || _.isString(prop.type)) &&
      _.isPlainObject(prop.props) && _.isArray(prop.children)) {
    // We can be pretty sure this is an element,
    return compileAndAddToMap(prop, process, elementMap, {errors})
  } else {
    return prop
  }
}

function getPhrase (element) {
  return _.isString(element.type)
    ? phrases[element.type]
    : element.type
}

function tryRunning (func, errors, messages, defaultIfError = null) {
  if (errors === 'log') {
    try {
      return func()
    } catch (e) {
      console.error(...messages, e)
      return defaultIfError
    }
  } else {
    return func()
  }
}

function compileNonRoot (element, process, {errors}) {
  // ignore null elements
  if (element == null) return () => []

  // assign defaultProps
  element = applyDefaults(element)

  if (process) {
    element = tryRunning(() => process(element), errors, ['An error occurred processing', element])

    // allow process calls to nullify elements
    if (element == null) return () => []
  }

  const phrase = getPhrase(element)

  // call describe
  if (phrase.describe) {
    if (phrase.lazy === false) {
      const description = tryRunning(() => phrase.describe(element), errors, ['An error occurred describing', element])

      const traverse = compileNonRoot(description, process, {errors})
      return addOutbound(element, traverse, {errors})
    } else {
      let subTraverse
      const traverse = (input) => {
        if (!subTraverse) {
          const description = tryRunning(() => phrase.describe(element), errors, ['An error occurred dynamically describing', element])
          subTraverse = compileNonRoot(description, process, {errors})
        }
        return subTraverse(input)
      }
      return addOutbound(element, traverse, {errors})
    }
  }

  const elementMap = new Map()

  // if there's no describe, check to see if any props are elements
  // and compile those
  _.forEach(element.props, (prop) => compileProp(prop, process, elementMap, {errors}))

  // generate the traverse thunk
  _.forEach(element.children, (child) => {
    return compileAndAddToMap(child, process, elementMap, {errors})
  })

  const subTraverse = (subElem, option) => next(elementMap, process, subElem, option, {errors})
  const traverse = (option) => {
    return tryRunning(() => phrase.visit(option, element, subTraverse), errors, ['An error occurred visiting', element], [])
  }

  return addOutbound(element, traverse, {errors})
}

function addOutbound (element, traverse, {errors}) {
  return function * (option) {
    const start = option.words.length

    const mods = {}
    if (element.props.data != null) {
      mods.data = _.concat(option.data, [element.props.data])
    }
    const newOption = _.assign({}, option, mods)

    for (let output of traverse(newOption)) {
      if (isComplete(output)) {
        if (element.type.mapResult) {
          const newResult = tryRunning(() => element.type.mapResult(output.result, element), errors, ['An error occurred in mapResult of', element], output.result)
          output = _.assign({}, output, {result: newResult})
        }

        if (element.type.filterResult) {
          const filterResultResult = tryRunning(() => element.type.filterResult(output.result, element), errors, ['An error occurred in filterResult of', element], true)
          if (!filterResultResult) {
            continue
          }
        }
      }

      const end = output.words.length

      const mods = {}
      if (element.props.value != null) {
        mods.result = element.props.value
      }
      if (element.props.score != null) {
        mods.score = element.props.score
      }
      if (element.props.multiplier != null) {
        mods.score = element.props.multiplier * (element.props.score == null ? output.score : element.props.score)
      }
      _.forEach([
        ['qualifiers', 'qualifier'],
        ['arguments', 'argument'],
        ['annotations', 'annotation'],
        ['categories', 'category']
      ], ([plural, singular]) => {
        if (element.props[plural] != null || element.props[singular] != null) {
          const theseAdditions = element.props[plural] || [element.props[singular]]
          const outputAdditions = _.map(theseAdditions, addition => {
            return {value: addition, start, end}
          })
          mods[plural] = _.concat(outputAdditions , output[plural])
        }
      })

      yield _.assign({}, output, mods)
    }
  }
}

export default function compile (element, process, {errors = 'none'} = {}) {
  const compiled = compileNonRoot(element, process, {errors})
  return function traverse (input) {
    const postProcessed = postProcess(compiled, input)
    const allOutputs = Array.from(postProcessed)
    return _.sortBy(allOutputs, (output) => -output.score)
  }
}

function * postProcess (compiled, input) {
  const option = createOption({text: input})
  const outputs = compiled(option)

  for (let output of outputs) {
    if (output.text === '' || output.text == null) {
      _.forEach(output.callbacks, callback => callback())

      const newOutput = _.clone(output)
      delete newOutput.callbacks
      yield newOutput
    }
  }
}
