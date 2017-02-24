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
  if (object.synonymGroup != null) { object.synonymGroups = [object.synonymGroup] }

  return object
}

function * doOneMatch ({input, inputLower, items, match, alreadyYieldedIndicies, synonymSet, uniqueSet, unique}) {
  // Need to use for-of so we can use yield, no fun _.forEach here
  let i = -1
  for (let item of items) {
    i++
    if (alreadyYieldedIndicies[i]) { continue }
    if (unique) {
      const uniques = unique === 'array' ? item.value : [item.value]
      if (!checkAgainstUniqueSet(uniqueSet, ...uniques)) { continue }
    }
    if (item.synonymGroups && !checkAgainstUniqueSet(synonymSet, ...item.synonymGroups)) { continue }

    const matchObj = match({input, inputLower, text: item.text, textLower: item.textLower})
    if (matchObj) {
      matchObj.result = item.value
      if (item.qualifiers) { matchObj.qualifiers = item.qualifiers }
      if (item.categories) { matchObj.categories = item.categories }
      if (item.arguments) { matchObj.arguments = item.arguments }
      if (item.annotations) { matchObj.annotations = item.annotations }
      if (item.data) { matchObj.data = item.data }
      alreadyYieldedIndicies[i] = true
      if (item.synonymGroups) {

      }
      if (unique) {
        const uniques = unique === 'array' ? item.value : [item.value]
        addToUniqueSet(uniqueSet, ...uniques)
      }
      if (item.synonymGroups) {
        addToUniqueSet(synonymSet, ...item.synonymGroups)
      }
      yield matchObj
    }
  }
}

function * doAppropriateMatches (input, items, props) {
  const inputLower = _.deburr(input ? input.toLowerCase() : null)

  const alreadyYieldedIndicies = []
  const uniqueSet = props.unique ? new Set() : null
  const synonymSet = new Set()
  const options = {
    input, inputLower, items, alreadyYieldedIndicies, uniqueSet, synonymSet, unique: props.unique
  }
  yield* doOneMatch(_.assign({}, options, {match: nullMatch}))
  yield* doOneMatch(_.assign({}, options, {match: beginningMatch}))

  if (props.strategy === 'contain' || props.strategy === 'fuzzy') {
    yield* doOneMatch(_.assign({}, options, {match: anywhereMatch}))
  }

  if (props.strategy === 'fuzzy') {
    yield* doOneMatch(_.assign({}, options, {match: fuzzyMatch}))
  }
}

function * compute (input, items, props) {
  const resultIterator = doAppropriateMatches(input, items, props)
  yield * resultIterator
}
