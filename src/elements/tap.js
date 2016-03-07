function * traverse (option, {props, children, next}) {
  if (props.inbound) props.inbound(option)

  if (props.outbound) {
    for (let output of next(option, children[0])) {
      props.outbound(output)
      yield output
    }
  } else {
    yield * next(option, children[0])
  }
}

export default {traverse}
