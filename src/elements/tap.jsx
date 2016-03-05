import reconcile from '../reconcile'

export default {
  * parse (option, {props, children}) {
    if (props.inbound) props.inbound(option)

    if (props.outbound) {
      for (let output of children[0].traverse(option)) {
        props.outbound(output)
        yield output
      }
    } else {
      yield* traverse(children[0], option)
    }
  }
}
