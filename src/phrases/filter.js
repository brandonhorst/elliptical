import {isComplete} from '../utils'

function * traverse (option, {props, children, next}) {
  if (props.inbound) {
    if (!props.inbound(option)) {
      return
    }
  }

  for (let output of next(option, children[0])) {
    if (props.skipIncomplete && !isComplete(output)) {
      yield output
    } else {
      if (!props.outbound || props.outbound(output)) {
        yield output
      }
    }
  }
}

export default {traverse}
