import _ from 'lodash'

export default function stackFind(stack, property, override, otherwise) {
  if (override != null) return override

  const stackEntry = _.findLast(stack, entry => entry[property] != null)
  return stackEntry ? stackEntry[property] : otherwise
}
