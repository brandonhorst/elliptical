import {isComplete} from '../utils'

const defaultProps = {
  skipIncomplete: false,
  option: false
}

function * visit (option, {props, children}, traverse) {
  if (props.inbound) {
    if (!props.inbound(props.option ? option : option.result)) {
      return
    }
  }

  for (let output of traverse(children[0], option)) {
    if (props.skipIncomplete && !isComplete(output)) {
      yield output
    } else {
      if (!props.outbound ||
          props.outbound(props.option ? output : output.result)) {
        yield output
      }
    }
  }
}

export default {defaultProps, visit}
