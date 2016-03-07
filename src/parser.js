/** @jsx createElement */

import createElement from './element'
import createOption from './option'
import createStore from './store'
import compile from './compile'

export default function createParser (element) {
  const store = createStore()
  const root = <base>{element}</base>

  let traverse = compile(root, store.register)
  store.data.subscribe({
    next () {
      traverse = compile(root, store.register)
    }
  })

  return {
    parse (input) {
      return Array.from(traverse(createOption({text: input})))
    },
    store
  }
}
