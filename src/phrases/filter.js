import {isComplete} from '../utils'

const defaultProps = {
  skipIncomplete: false,
  option: false
}

function * traverse (option, {props, children, next}) {
  if (props.inbound) {
    if (!props.inbound(props.option ? option : option.result)) {
      return
    }
  }

  for (let output of next(option, children[0])) {
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

export default {defaultProps, traverse}
