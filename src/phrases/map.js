import _ from 'lodash'
import {limitIterator, isComplete} from '../utils'

function * traverse (option, {props, children, next}) {
  // preprocess with inbound
  let newOption = option
  if (props.inbound) {
    newOption = props.inbound(option)
  }

  const iterator = next(newOption, children[0])
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

export default {traverse}

