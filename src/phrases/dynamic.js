import _ from 'lodash'
import {limitIterator, substrings} from '../utils'

function * optionsForString (string, option, element, traverse) {
  const description = element.props.describe
    ? element.props.describe(string)
    : undefined

  if (description) {
    yield * traverse(description, option)
  }
}

function * traversesForSubstrings (option, element, traverse) {
  const iterations = option.text == null
    ? [undefined]
    : substrings(option.text, element.props)

  for (let substring of iterations) {
    yield optionsForString(substring, option, element, traverse)
  }
}

function * visit (option, element, traverse) {
  const traverses = traversesForSubstrings(option, element, traverse)
  yield * limitIterator(traverses, element.props.limit)
}

export default {visit}
