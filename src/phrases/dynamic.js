import _ from 'lodash'
import compile from '../compile'
import {substrings} from '../string-utils'
import {limitIterator} from '../utils'

function * optionsForString (string, option, props, register) {
  const observation = props.observe
    ? props.observe(string, {props: {}, children: []})
    : undefined

  const currentValue = observation ? register(observation) : undefined

  const description = props.describe
    ? props.describe(
      {props: {}, children: [], data: currentValue}
    ) : undefined

  if (description) {
    const traverse = compile(description)
    yield * traverse(option)
  }
}

function * optionsForSubstrings (option, props, register) {
  const iterations = option.text == null
    ? [undefined]
    : substrings(option.text, props)

  for (let substring of iterations) {
    let success = false
    yield* optionsForString(substring, option, props, register)
  }
}

function * traverse (option, {props, register}) {
  const options = optionsForSubstrings(option, props, register)
  yield * limitIterator(options, props.limit)
}

export default {traverse}
