/** @jsx createElement */
import _ from 'lodash'
import createElement from '../src/element'
import option from '../src/option'
import compile from '../src/compile'

export function text (input) {
  return _.map(input.words, word => word.text || word.label).join('')
}

export function compileAndTraverse (element, input, options) {
  const traverse = compile(element, null, options)
  return traverse(input)
}
