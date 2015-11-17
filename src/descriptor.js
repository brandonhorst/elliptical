import _ from 'lodash'

export function getRealProps({descriptor, Constructor}) {
  const realProps = _.defaults(descriptor.props || {}, Constructor.defaultProps || {})
  if (descriptor.children && descriptor.children.length > 0) {
    realProps.children = _.flattenDeep(descriptor.children)
  }
  return realProps
}
