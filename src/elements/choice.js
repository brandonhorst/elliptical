import _ from 'lodash'

function * traverse (option, {props: {limit}, children, next}) {
  let successes = 0
  if (children && children.length > 0) {
    for (let child of children) {
      let success = false

      // performance optimization
      if (child.attributes.id == null && !limit) {
        yield * next(option, child)
      } else {
        for (let output of next(option, child)) {
          const newResult = child.attributes.id != null
            ? {[child.attributes.id]: output.result}
            : output.result

          const mods = {result: newResult}

          if (limit) {
            mods.callbacks = output.callbacks.concat(() => {
              success = true
            })
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

export default {traverse}
