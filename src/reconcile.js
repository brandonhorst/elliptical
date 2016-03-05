import _ from 'lodash'

export default function reconcile (element, register) {
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

    return setAutos(element, reconcile(description, register))
  }

  // if there's no describe, call reconcile and let it set props
  let props = element.attributes
  if (element.type.reconcile) {
    props = element.type.reconcile({props: element.attributes})
  }

  // generate the parse thunk
  const children = _.map(element.children, child => {
    return _.assign({}, child, {traverse: reconcile(child, register)})
  })

  return setAutos(element, (option) => {
    const outputs = element.type.parse(option, {
      props,
      children,
      register
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