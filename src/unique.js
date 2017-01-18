import _ from 'lodash'
import stringify from 'json-stable-stringify'
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
    return stringify(result)
  }
}

export function checkAgainstUniqueSet(uniqueSet, ...results) {
  return !_.chain(results)
    .reject(result => result == null)
    .map(getUniqueValue)
    .every(value => uniqueSet.has(value))
    .value()
}

export function checkAgainstResultList(resultList, ...results) {
  return !_.chain(results)
    .reject(result => result == null)
    .map(getUniqueValue)
    .every(value => _.some(resultList, compareResult => getUniqueValue(compareResult) === value))
    .value()
}

export function addToUniqueSet(uniqueSet, ...results) {
  _.chain(results)
    .reject(result => result == null)
    .map(getUniqueValue)
    .forEach(value => {
      uniqueSet.add(value)
    })
    .value()
}