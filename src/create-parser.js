import _ from 'lodash'
import createOption from './create-option'
import createStore from './create-store'
import reconcile from './reconcile'

export default function createParser (element) {
  const store = createStore()

  let traverse = reconcile(element, store.register)
  store.subscribe({
    next() {
      traverse = reconcile(element, store.register)
    }
  })

  return {
    parse (input) {
      const trueOutputs = []
      const outputs = traverse(createOption(input))
      for (let output of outputs) {
        if (output.text == null || output.text === '') {
          _.forEach(output.callbacks, callback => callback())
          trueOutputs.push(_.omit(output, ['callbacks', '_previousEllipsis']))
        }
      }
      return trueOutputs
    },
    store
  }
}