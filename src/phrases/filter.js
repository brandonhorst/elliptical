import {isComplete} from '../utils'

const defaultProps = {
  skipIncomplete: false
}

function * visit (option, {props, children}, traverse) {
  if (props.inbound) {
    if (!props.inbound(option)) {
      return
    }
  }

  for (let output of traverse(children[0], option)) {
    if (props.skipIncomplete && !isComplete(output)) {
      yield output
    } else {
      if (!props.outbound || props.outbound(output)) {
        yield output
      }
    }
  }
}

export default {defaultProps, visit}
