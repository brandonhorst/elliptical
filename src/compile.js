import _ from 'lodash'
import {isComplete} from './utils'
import * as phrases from './phrases'
import {nextSymbol} from './symbols'


function addNext (element, process) {
  try {
    const next = compile(element, process)
    const newElement = _.clone(element) // _.assign can't do symbols
    newElement[nextSymbol] = next
    return newElement
  } catch (e) {
    console.log('element failed compliation')
    console.log(element)
    console.error(e)
    console.log()
    return element
  }
}

export default function compile (element, process) {
  // ignore null elements
  if (element == null) return () => []

  if (process) {
    element = process(element)
    if (element == null) return () => []
  }

  // assign defaultProps
  element = _.assign({}, element, {
    props: _.defaults({}, element.props, element.type.defaultProps || {})
  })

  const phrase = _.isString(element.type)
    ? phrases[element.type]
    : element.type

  // call describe
  if (phrase.describe) {
    let description = phrase.describe(element)
    const traverse = compile(description, process)
    return setAutos(element, traverse)
  }

  // if there's no describe, check to see if any props are elements
  // and compile those
  const propsWithNext = _.mapValues(element.props, (prop) => {
    if (prop && prop.type && prop.props && prop.children &&
        (_.isPlainObject(prop.type) || _.isString(prop.type)) &&
        _.isPlainObject(prop.props) && _.isArray(prop.children)) {
      // We can be pretty sure this is an element,
      return addNext(prop, process)
    } else {
      return prop
    }
  })

  // generate the traverse thunk
  const childrenWithNext = _.map(element.children, (child) => {
    return addNext(child, process)
  })

  element = _.assign({}, element, {
    props: propsWithNext,
    children: childrenWithNext
  })

  function traverse (option) {
    return phrase.visit(option, element)
  }

  return setAutos(element, traverse)
}

function setAutos (element, traverse) {
  return function * (option) {
    for (let output of traverse(option)) {
      if (element.type.validate &&
          isComplete(output) &&
          !element.type.validate(output.result, element)) {
        continue
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
