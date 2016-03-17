import _ from 'lodash'
import traverse from '../traverse'
import {limitIterator} from '../utils'

function * traverseChild (option, child) {
  const childOutputs = traverse(option, child)

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

function * childrenTraversals (option, children) {
  if (children && children.length > 0) {
    for (let child of children) {
      yield traverseChild(option, child)
    }
  }
}

function * visit (option, {props, children}) {
  const traversals = childrenTraversals(option, children)
  yield * limitIterator(traversals, props.limit)
}

export default {visit}
