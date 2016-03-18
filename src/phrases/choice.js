import _ from 'lodash'
import {limitIterator} from '../utils'

function * traverseChild (option, child, traverse) {
  const childOutputs = traverse(child, option)

  // slight performance optimization
  if (child.props.id == null) {
    yield * childOutputs
  } else {
    for (let output of childOutputs) {
      const newResult = child.props.id != null
        ? {[child.props.id]: output.result}
        : output.result

      const mods = {result: newResult}

      yield _.assign({}, output, mods)
    }
  }
}

function * childrenTraversals (option, children, traverse) {
  if (children && children.length > 0) {
    for (let child of children) {
      yield traverseChild(option, child, traverse)
    }
  }
}

function * visit (option, {props, children}, traverse) {
  const traversals = childrenTraversals(option, children, traverse)
  yield * limitIterator(traversals, props.limit)
}

export default {visit}
