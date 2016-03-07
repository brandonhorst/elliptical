import _ from 'lodash'
import compile from '../compile'
import { substrings } from '../string-utils'

function * traverse (option, {props, register}) {
  let successes = 0

  let substringOpts = {
    splitOn: props.splitOn,
    noSplit: props.consumeAll,
    reverse: props.greedy
  }

  const iterations = option.text == null ? ['\uFFFD'] : substrings(option.text, substringOpts)

  for (let substring of iterations) {
    let success = false

    const observation = props.observe
      ? props.observe(
        substring === '\uFFFD' ? undefined : substring,
        {props: {}, children: []}
      ) : undefined

    const currentValue = observation ? register(observation) : undefined

    const description = props.describe
      ? props.describe(
        {props: {}, children: [], data: currentValue}
      ) : undefined
    if (!description) continue

    const traverse = compile(description)

    const results = traverse(option)

    if (props.limit) {
      for (let output of results) {
        yield _.assign({}, output, {
          callbacks: output.callbacks.concat(() => { success = true })
        })
      }

      if (success) successes++
      if (props.limit <= successes) break
    } else {
      yield * results
    }
  }
}

export default {traverse}
