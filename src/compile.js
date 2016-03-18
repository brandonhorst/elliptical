import _ from 'lodash'
import {isComplete} from './utils'
import * as phrases from './phrases'
import createOption from './option'

function applyDefaults (element) {
  return _.assign({}, element, {
    props: _.defaults({}, element.props, element.type.defaultProps || {})
  })
}

function compileSubElement (subElement, process, elementMap) {
  let traverse
  try {
    traverse = compileNonRoot(subElement, process)
  } catch (e) {
    console.log(`Element failed compilation. Element: ${subElement}`)
    console.error(e)
    return subElement
  }

  elementMap.set(subElement, traverse)
}

function next (elementMap, subElement, option) {
  const traverser = elementMap.get(subElement)
  if (traverser) {
    return traverser(option)
  } else {
    throw new Error(`Attempted to traverse non-compiled element: ${JSON.stringify(subElement)}`)
  }
}

function compileProp (prop, process, elementMap) {
  if (prop && prop.type && prop.props && prop.children &&
      (_.isPlainObject(prop.type) || _.isString(prop.type)) &&
      _.isPlainObject(prop.props) && _.isArray(prop.children)) {
    // We can be pretty sure this is an element,
    return compileSubElement(prop, process, elementMap)
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
    let description = phrase.describe(element)
    const traverse = compileNonRoot(description, process)
    return addOutbound(element, traverse)
  }

  const elementMap = new Map()

  // if there's no describe, check to see if any props are elements
  // and compile those
  _.forEach(element.props, (prop) => compileProp(prop, process, elementMap))

  // generate the traverse thunk
  _.forEach(element.children, (child) => {
    return compileSubElement(child, process, elementMap)
  })

  const subTraverse = (subElem, option) => next(elementMap, subElem, option)
  const traverse = (option) => phrase.visit(option, element, subTraverse)

  return addOutbound(element, traverse)
}

function addOutbound (element, traverse) {
  return function * (option) {
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

      const mods = {}
      if (element.props.value != null) {
        mods.result = element.props.value
      }
      if (element.props.qualifiers != null) {
        mods.qualifiers = element.props.qualifiers
      }
      if (element.props.score != null) {
        mods.score = element.props.score
      }

      yield _.assign({}, output, mods)
    }
  }
}

export default function compile (element, process) {
  const compiled = compileNonRoot(element, process)
  return function traverse (input) {
    const postProcessed = postProcess(compiled, input)
    return Array.from(postProcessed)
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