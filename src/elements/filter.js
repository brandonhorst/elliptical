import {isComplete} from '../utils'

function * traverse (option, {
  props: {func = () => true, incomplete = false},
  children,
  next
}) {
  for (let output of next(option, children[0])) {
    if (incomplete || isComplete(output)) {
      if (func(output.result)) {
        yield output
      }
    } else {
      yield output
    }
  }
}

export default {traverse}
