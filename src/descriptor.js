import _ from 'lodash'
import * as builtinPhrases from './elements'
import * as builtinSources from './sources'

export function getConstructor({Constructor, type}) {
  if (_.isString(Constructor)) {
    const builtins = getBuiltinsForType(type)

    if (_.has(builtins, Constructor)) {
      return builtins[Constructor]
    } else {
      throw new Error(`${Constructor} is an invalid phrase. Note: non-builtin phrases must be uppercase`)
    }
  }
  return Constructor
}

function getBuiltinsForType(type) {
  if (type === 'phrase') {
    return builtinPhrases
  } else if (type === 'source') {
    return builtinSources
  } else {
    throw new Error(`${type} is an invalid constructor type.`)
  }
}


export function getRealProps({descriptor, Constructor}) {
  const realProps = _.defaults(descriptor.props || {}, Constructor.defaultProps || {})
  if (descriptor.children && descriptor.children.length > 0) {
    realProps.children = _.flattenDeep(descriptor.children)
  }
  return realProps
}
