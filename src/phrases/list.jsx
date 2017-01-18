/** @jsx createElement */
import _ from 'lodash'
import createElement from '../element'
import {checkAgainstUniqueSet, addToUniqueSet} from '../unique'
import { nullMatch, beginningMatch, anywhereMatch, fuzzyMatch } from '../match'

export default {
  describe ({props}) {
    props = _.defaults({}, props, {strategy: 'start'})
    const trueItems = _.chain(props.items)
      .reject(item => item == null)
      .map(itemify)
      .value()

    return <raw
      func={(option) => compute(option.text, trueItems, props)}
      limit={props.limit} />
  }
}

function itemify (item) {
  const object = _.isString(item)
    ? {text: item, textLower: _.deburr(item.toLowerCase())}
    : _.assign({}, item, {textLower: _.deburr(item.text.toLowerCase())})
  if (object.qualifier != null) { object.qualifiers = [object.qualifier] }
  if (object.argument != null) { object.arguments = [object.argument] }
  if (object.category != null) { object.categories = [object.category] }
  if (object.annotation != null) { object.annotations = [object.annotation] }

  return object
}

function * doOneMatch (input, inputLower, items, match, alreadyYieldedIndicies, uniqueSet, unique) {
  // Need to use for-of so we can use yield, no fun _.forEach here
  let i = -1
  for (let item of items) {
    i++
    if (alreadyYieldedIndicies[i]) { continue }
    if (unique) {
      const uniques = unique === 'array' ? item.value : [item.value]
      if (!checkAgainstUniqueSet(uniqueSet, ...uniques)) { continue }
    }

    const matchObj = match({input, inputLower, text: item.text, textLower: item.textLower})
    if (matchObj) {
      matchObj.result = item.value
      if (item.qualifiers) { matchObj.qualifiers = item.qualifiers }
      if (item.categories) { matchObj.categories = item.categories }
      if (item.arguments) { matchObj.arguments = item.arguments }
      if (item.annotations) { matchObj.annotations = item.annotations }
      if (item.data) { matchObj.data = item.data }
      alreadyYieldedIndicies[i] = true
      if (unique) {
        const uniques = unique === 'array' ? item.value : [item.value]
        addToUniqueSet(uniqueSet, ...uniques)
      }
      yield matchObj
    }
  }
}

function * doAppropriateMatches (input, items, props) {
  const inputLower = _.deburr(input ? input.toLowerCase() : null)

  const alreadyYieldedIndicies = []
  const uniqueSet = props.unique ? new Set() : null
  yield* doOneMatch(input, inputLower, items, nullMatch, alreadyYieldedIndicies, uniqueSet, props.unique)
  yield* doOneMatch(input, inputLower, items, beginningMatch, alreadyYieldedIndicies, uniqueSet, props.unique)

  if (props.strategy === 'contain' || props.strategy === 'fuzzy') {
    yield* doOneMatch(input, inputLower, items, anywhereMatch, alreadyYieldedIndicies, uniqueSet, props.unique)
  }

  if (props.strategy === 'fuzzy') {
    yield* doOneMatch(input, inputLower, items, fuzzyMatch, alreadyYieldedIndicies, uniqueSet, props.unique)
  }
}

function * compute (input, items, props) {
  const resultIterator = doAppropriateMatches(input, items, props)
  yield * resultIterator
}
