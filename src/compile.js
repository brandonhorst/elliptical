import _ from 'lodash'
import {isComplete} from './utils'
import * as phrases from './phrases'
import createOption from './option'

function applyDefaults (element) {
  return _.assign({}, element, {
    props: _.defaults({}, element.props, element.type.defaultProps || {})
  })
}

function compileAndAddToMap (subElement, process, elementMap) {
  let traverse
  try {
    traverse = compileNonRoot(subElement, process)
  } catch (e) {
    const message = `Element failed compilation. Element: ${JSON.stringify(subElement)}, Message: ${e.message}`
    e.message = message
    throw e
  }

  elementMap.set(subElement, traverse)

  return traverse
}

function next (elementMap, process, subElement, option) {
  let traverser = elementMap.get(subElement)
  if (traverser) {
    return traverser(option)
  } else {
    const newTraverser = compileAndAddToMap(subElement, process, elementMap)
    return newTraverser(option)
  }
}

function compileProp (prop, process, elementMap) {
  if (prop && prop.type && prop.props && prop.children &&
      (_.isPlainObject(prop.type) || _.isString(prop.type)) &&
      _.isPlainObject(prop.props) && _.isArray(prop.children)) {
    // We can be pretty sure this is an element,
    return compileAndAddToMap(prop, process, elementMap)
  } else {
    return prop
  }
}

function getPhrase(element) {
  return _.isString(element.type)
    ? phrases[element.type]
    : element.type
}

function compileNonRoot (element, process) {
  // ignore null elements
  if (element == null) return () => []

  // assign defaultProps
  element = applyDefaults(element)

  if (process) {
    element = process(element)

    // allow process calls to nullify elements
    if (element == null) return () => []
  }

  const phrase = getPhrase(element)

  // call describe
  if (phrase.describe) {
    if (phrase.lazy === false) {
      const description = phrase.describe(element)
      const traverse = compileNonRoot(description, process)
      return addOutbound(element, traverse)
    } else {
      let subTraverse
      function traverse (input) {
        if (!subTraverse) {
          const description = phrase.describe(element)
          subTraverse = compileNonRoot(description, process)
        }
        return subTraverse(input)
      }
      return addOutbound(element, traverse)
    }
  }

  const elementMap = new Map()

  // if there's no describe, check to see if any props are elements
  // and compile those
  _.forEach(element.props, (prop) => compileProp(prop, process, elementMap))

  // generate the traverse thunk
  _.forEach(element.children, (child) => {
    return compileAndAddToMap(child, process, elementMap)
  })

  const subTraverse = (subElem, option) => next(elementMap, process, subElem, option)
  const traverse = (option) => phrase.visit(option, element, subTraverse)

  return addOutbound(element, traverse)
}

function addOutbound (element, traverse) {
  return function * (option) {
    const start = option.words.length

    for (let output of traverse(option)) {
      if (isComplete(output)) {
        if (element.type.mapResult) {
          const newResult = element.type.mapResult(output.result, element)
          output = _.assign({}, output, {result: newResult})
        }

        if (element.type.filterResult &&
            !element.type.filterResult(output.result, element)) {
          continue
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

export default function compile (element, process) {
  const compiled = compileNonRoot(element, process)
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