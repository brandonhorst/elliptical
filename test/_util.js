import _ from 'lodash'

import createOption from '../src/create-option'
import reconcile from '../src/reconcile'

export function text (input) {
  return _.map(input.words, 'text').join('')
}

export function reconcileAndTraverse (element, input, register) {
  const outputs = []

  const traverse = reconcile(element, register)
  for (let option of traverse(createOption(input))) {
    if (option.text == null || option.text === '') {
      _.forEach(option.callbacks, callback => callback())
      outputs.push(_.omit(option, ['callbacks', '_previousEllipsis']))
    }
  }
  return outputs
}