import {isComplete} from '../utils'

export default {
  * parse (option, {
    props: {func = () => true, incomplete = false},
    children
  }
) {
    for (let output of children[0].traverse(option)) {
      if (incomplete || isComplete(output)) {
        if (func(output.result)) {
          yield output
        }
      } else {
        yield output
      }
    }
  }
}
