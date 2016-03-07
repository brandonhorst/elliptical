import _ from 'lodash'

function hasPlaceholder (output) {
  return _.some(output.words, 'placeholder')
}

function * traverse (option, {props, children, next}) {
  for (let output of next(option, children[0])) {
    if (!props.incomplete && hasPlaceholder(output)) {
      yield output
    } else {
      if (props.func && !props.flat) {
        const newResult = props.func(output.result)
        const mods = {result: newResult}
        yield _.assign({}, output, mods)
      } else if (props.func) {
        let successes = 0

        const newIterator = props.func(output.result)
        for (let newResult of newIterator) {
          let success = false

          const mods = {result: newResult}
          if (props.limit) {
            mods.callbacks = output.callbacks.concat(() => { success = true })
          }

          yield _.assign({}, output, mods)

          if (props.limit) {
            if (success) successes++
            if (props.limit <= successes) break
          }
        }
      }
    }
  }
}

export default {traverse}

