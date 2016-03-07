import _ from 'lodash'

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

  // call observe
  if (element.type.observe) {
    const observation = element.type.observe({
      props: element.attributes,
      children: element.children
    })

    data = register(observation)
  }

  // call describe
  if (element.type.describe) {
    const description = element.type.describe({
      props: element.attributes,
      children: element.children,
      data
    })

    return setAutos(element, compile(description, register))
  }

  // if there's no describe, call compile and let it set props
  const reconciledAttrs = _.mapValues(element.attributes, (attribute) => {
    if (attribute && attribute.type && attribute.attributes &&
        attribute.children && _.isPlainObject(attribute.type) &&
        _.isPlainObject(attribute.type) && _.isArray(attribute.children)) {
      // We can be pretty sure this is an element,
      return addNext(attribute, register)
    } else {
      return attribute
    }
  })

  // generate the traverse thunk
  const children = _.map(element.children, (child) => {
    return addNext(child, register)
  })

  return setAutos(element, (option) => {
    const outputs = element.type.traverse(option, {
      props: reconciledAttrs,
      children,
      data,
      register,
      next
    })

    return outputs
  })
}

function setAutos (element, traverse) {
  return function * (option) {
    for (let output of traverse(option)) {
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
