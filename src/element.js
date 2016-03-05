import _ from 'lodash'
import * as elements from './elements'

export default function (type, attributes, ...children) {
  const trueType = typeof type === 'string' ? elements[type] : type

  return {
    type: trueType,
    attributes: attributes || {},
    children: _.flattenDeep(children)
  }
}