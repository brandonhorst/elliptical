import _ from 'lodash'
const unique = Symbol.for('lacona-unique-key')

export default unique

function getUniqueValue (result) {
  if (!_.isObject(result)) {
    return result
  } else if (result[unique] != null) {
    if (_.isFunction(result[unique])) {
      return result[unique](result)
    } else {
      return result[unique]
    }
  } else {
    return result
  }
}

export function checkAgainstUniqueList(result, uniqueList) {
  if (result == null) return true

  const value = getUniqueValue(result)

  if (_.isObject(value)) {
    return !_.some(uniqueList, _.partial(_.isEqual, _, value))
  } else {
    return !_.includes(uniqueList, value)
  }
}

export function checkAgainstResultList(result, resultList) {
  if (result == null) return true

  const value = getUniqueValue(result)

  if (_.isObject(value)) {
    return !_.some(resultList, compareResult => _.isEqual(getUniqueValue(compareResult), value))
  } else {
    return !_.some(resultList, compareResult => getUniqueValue(compareResult) === value)
  }
}

export function addToUniqueList(result, uniqueList) {
  const value = getUniqueValue(result)

  if (result != null) {
    uniqueList.splice(uniqueList.length, 0, value)
  }
}