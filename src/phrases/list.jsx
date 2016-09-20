/** @jsx createElement */
import _ from 'lodash'
import createElement from '../element'
import { nullMatch, beginningMatch, anywhereMatch, fuzzyMatch } from '../match'

export default {
  describe ({props}) {
    props = _.defaults({}, props, {strategy: 'start'})
    const trueItems = _.map(props.items, itemify)

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

function * doOneMatch (input, inputLower, items, match, alreadyYielded) {
  // Need to use for-of so we can use yield, no fun _.forEach here
  let i = -1
  for (let item of items) {
    i++
    if (alreadyYielded[i]) continue

    const matchObj = match({input, inputLower, text: item.text, textLower: item.textLower})
    if (matchObj) {
      matchObj.result = item.value
      matchObj.qualifiers = item.qualifiers
      matchObj.categories = item.categories
      matchObj.arguments = item.arguments
      matchObj.annotations = item.annotations
      alreadyYielded[i] = true
      yield matchObj
    }
  }
}

function * doAppropriateMatches (input, items, props) {
  const inputLower = _.deburr(input ? input.toLowerCase() : null)

  const alreadyYielded = []
  yield* doOneMatch(input, inputLower, items, nullMatch, alreadyYielded)
  yield* doOneMatch(input, inputLower, items, beginningMatch, alreadyYielded)

  if (props.strategy === 'contain' || props.strategy === 'fuzzy') {
    yield* doOneMatch(input, inputLower, items, anywhereMatch, alreadyYielded)
  }

  if (props.strategy === 'fuzzy') {
    yield* doOneMatch(input, inputLower, items, fuzzyMatch, alreadyYielded)
  }
}

function * compute (input, items, props) {
  const resultIterator = doAppropriateMatches(input, items, props)
  
  if (props.value != null) {
    for (let output of resultIterator) {
      yield _.assign({}, output, {result: props.value})
    }
  } else {
    yield * resultIterator
  }
}
