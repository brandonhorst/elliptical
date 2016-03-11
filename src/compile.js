import _ from 'lodash'
import {isComplete} from './utils'
import * as components from './components'

const nextSymbol = Symbol('tarse-compile-next')

function next (option, element) {
  return element[nextSymbol](option)
}

function addNext (element, register) {
  try {
    const next = compile(element, register)
    const newElement = _.clone(element) // _.assign can't do symbols
    newElement[nextSymbol] = next
    return newElement
  } catch (e) {
    console.log('element failed reconciliation.')
    console.log(element)
    console.error(e)
    console.log()
    return element
  }
}

export default function compile (element, register) {
  let data

  if (element == null) {
    return () => []
  }

  const component = _.isString(element.type)
    ? components[element.type]
    : element.type

  const model = {
    props: _.defaults({}, element.props, element.type.defaultProps || {}),
    children: element.children
  }

  // call observe, add data to model
  if (component.observe) {
    const observation = component.observe(model)

    model.data = register(observation)
  }

  // call describe
  if (component.describe) {
    const description = component.describe(model)

    return setAutos(element, model, compile(description, register))
  }

  // if there's no describe, call compile and let it set props
  model.props = _.mapValues(model.props, (prop) => {
    if (prop && prop.type && prop.props &&
        prop.children &&
        (_.isPlainObject(prop.type) || _.isString(prop.type)) &&
        _.isPlainObject(prop.props) && _.isArray(prop.children)) {
      // We can be pretty sure this is an element,
      return addNext(prop, register)
    } else {
      return prop
    }
  })

  // generate the traverse thunk
  model.children = _.map(element.children, (child) => {
    return addNext(child, register)
  })

  _.assign(model, {register, next})

  function traverse (option) {
    return component.traverse(option, model)
  }

  return setAutos(element, model, traverse)
}

function setAutos (element, model, traverse) {
  return function * (option) {
    for (let output of traverse(option)) {
      if (element.type.validate &&
          isComplete(output) &&
          !element.type.validate(output.result, model)) {
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
