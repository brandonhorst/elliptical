/** @jsx createElement */
import _ from 'lodash'
import createElement from '../src/element'
import option from '../src/option'
import compile from '../src/compile'

export function text (input) {
  return _.map(input.words, 'text').join('')
}

export function compileAndTraverse (element, input) {
  const traverse = compile(<base>{element}</base>)
  return Array.from(traverse(option({text: input})))
}
