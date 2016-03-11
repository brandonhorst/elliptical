import _ from 'lodash'
import {isComplete} from './utils'

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
    console.log(element, 'looks like an element but failed reconciliation.')
    console.error(e)
    return element
  }
}

export default function compile (element, register) {
  let data

  if (element == null) {
    return () => []
  }

  const model = {
    props: _.defaults({}, element.attributes, element.type.defaultProps || {}),
    children: element.children
  }

  // call observe, add data to model
  if (element.type.observe) {
    const observation = element.type.observe(model)

    model.data = register(observation)
  }

  // call describe
  if (element.type.describe) {
    const description = element.type.describe(model)

    return setAutos(element, model, compile(description, register))
  }

  // if there's no describe, call compile and let it set props
  model.props = _.mapValues(model.props, (props) => {
    if (props && props.type && props.attributes &&
        props.children && _.isPlainObject(props.type) &&
        _.isPlainObject(props.type) && _.isArray(props.children)) {
      // We can be pretty sure this is an element,
      return addNext(props, register)
    } else {
      return props
    }
  })

  // generate the traverse thunk
  model.children = _.map(element.children, (child) => {
    return addNext(child, register)
  })

  _.assign(model, {register, next})

  function traverse (option) {
    return element.type.traverse(option, model)
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
      if (element.attributes.value != null) {
        mods.result = element.attributes.value
      }
      if (element.attributes.qualifiers != null) {
        mods.qualifiers = element.attributes.qualifiers
      }
      if (element.attributes.score != null) {
        mods.score = element.attributes.score
      }

      yield _.assign({}, output, mods)
    }
  }
}
