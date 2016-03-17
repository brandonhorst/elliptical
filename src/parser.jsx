/** @jsx createElement */

import createElement from './element'
import createOption from './option'
import createStore from './store'
import compile from './compile'
import Observable from 'zen-observable'

export default function createParser (element, process) {
  const store = createStore()
  const root = <base>{element}</base>

  let currentObserver
  let currentInput
  let traverse = compile(root, {register: store.register, process})

  function compileAndTraverse () {
    traverse = compile(root, {register: store.register, process})
    const outputs = Array.from(traverse(createOption({text: currentInput})))
    currentObserver.next(outputs)
  }

  store.data.subscribe({
    next () {
      if (currentObserver) {
        compileAndTraverse()
      }
      traverse = compile(root, {register: store.register, process})
    }
  })

  return {
    watch (input) {
      if (currentObserver) {
        currentObserver.complete()
      }

      return new Observable((observer) => {
        currentObserver = observer
        currentInput = input
        compileAndTraverse()
      })
    },
    parse (input) {
      return Array.from(traverse(createOption({text: input})))
    },
    store
  }
}
