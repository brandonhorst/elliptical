import _ from 'lodash'
import traverse from '../traverse'
import {limitIterator, isComplete} from '../utils'

function * visit (option, {props, children}) {
  // preprocess with inbound
  let newOption = option
  if (props.inbound) {
    newOption = props.inbound(option)
  }

  const iterator = traverse(newOption, children[0])
  if (!props.outbound) {
    yield * iterator
    return
  }

  for (let output of iterator) {
    if (props.skipIncomplete && !isComplete(output)) {
      yield output
    } else {
      const mapped = props.outbound(output)
      if (mapped[Symbol.iterator]) {
        yield * limitIterator(mapped, props.limit)
      } else {
        yield mapped
      }
    }
  }
}

export default {visit}

