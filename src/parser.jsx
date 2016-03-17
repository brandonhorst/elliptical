/** @jsx createElement */

import createElement from './element'
import createOption from './option'
import compile from './compile'

export default function createParser (element, process) {
  const root = <base>{element}</base>

  let traverse = compile(root, process)

  return {
    parse (input) {
      return Array.from(traverse(createOption({text: input})))
    }
  }
}
