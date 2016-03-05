import _ from 'lodash'

function * parse (option, {props: {limit}, children}) {
  let successes = 0
  if (children && children.length > 0) {
    for (let child of children) {
      let success = false

      //performance optimization
      if (child.attributes.id == null && !limit) {
        yield* child.traverse(option)
      } else {
        for (let output of child.traverse(option)) {
          const newResult = child.attributes.id != null
            ? {[child.attributes.id]: output.result}
            : output.result

          const mods = {result: newResult}

          if (limit) {
            mods.callbacks = output.callbacks.concat(() => success = true)
          }
          yield _.assign({}, output, mods)
        }
      }

      if (limit) {
        if (success) successes++
        if (limit <= successes) break
      }
    }
  }
}

export default {parse}
