import _ from 'lodash'
import {limitIterator} from '../utils'
import {checkAgainstUniqueSet, addToUniqueSet} from '../unique'

function * traverseChild (option, child, traverse, synonymSet, synonymGroups) {
  const childOutputs = traverse(child, option)

  let addedToSet = false
  for (let output of childOutputs) {
    let toYield = output
    if (child.props.id != null) {
      const result = {[child.props.id]: output.result}
      toYield = _.assign({}, output, {result})
    }
    if (synonymGroups) {
      toYield = _.assign({}, output, {
        callbacks: _.concat(output.callbacks, [() => addToUniqueSet(synonymSet, ...synonymGroups)])
      })
    }
    yield toYield
  }
}

function * childrenTraversals (option, children, traverse, synonymSet, synonymGroups) {
  if (children && children.length > 0) {
    for (let child of children) {

      const synonymGroups = child.props.synonymGroups || (child.props.synonymGroup ? [child.props.synonymGroup] : null)
      if (synonymGroups && !checkAgainstUniqueSet(synonymSet, ...synonymGroups)) {
        continue
      }

      yield traverseChild(option, child, traverse, synonymSet, synonymGroups)
    }
  }
}

function * visit (option, {props, children}, traverse) {
  const synonymSet = new Set()
  const traversals = childrenTraversals(option, children, traverse, synonymSet)
  yield * limitIterator(traversals, props.limit)
}

export default {visit}
