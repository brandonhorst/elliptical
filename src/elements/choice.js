import _ from 'lodash'
import {limitIterator} from '../utils'

function * traverseChild (option, child, next) {
  const childOutputs = next(option, child)

  // slight performance optimization
  if (child.attributes.id == null) {
    yield * childOutputs
  } else {
    for (let output of childOutputs) {
      const newResult = child.attributes.id != null
        ? {[child.attributes.id]: output.result}
        : output.result

      const mods = {result: newResult}

      yield _.assign({}, output, mods)
    }
  }
}

function * childrenTraversals (option, children, next) {
  if (children && children.length > 0) {
    for (let child of children) {
      yield traverseChild(option, child, next)
    }
  }
}

function * traverse (option, {props, children, next}) {
  const traversals = childrenTraversals(option, children, next)
  yield * limitIterator(traversals, props.limit)
}

export default {traverse}
