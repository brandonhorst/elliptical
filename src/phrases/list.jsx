/** @jsx createElement */
import _ from 'lodash'
import createElement from '../element'
import { nullMatch, beginningMatch, anywhereMatch, fuzzyMatch } from '../match'

export default {
  describe ({props}) {
    props = _.defaults({}, props, {strategy: 'start'})
    const trueItems = _.map(props.items, itemify)

    return <raw
      func={(input) => compute(input, trueItems, props)}
      limit={props.limit} category={props.category} />
  }
}

function itemify (item) {
  return _.isString(item)
    ? {text: item, textLower: _.deburr(item.toLowerCase())}
    : _.assign({}, item, {textLower: _.deburr(item.text.toLowerCase())})
}

function * doOneMatch (input, inputLower, items, props, match, alreadyYielded) {
  // Need to use for-of so we can use yield, no fun _.forEach here
  let i = -1
  for (let item of items) {
    i++
    if (alreadyYielded[i]) continue

    const matchObj = match({input, inputLower, text: item.text, textLower: item.textLower})
    if (matchObj) {
      matchObj.result = item.value
      matchObj.qualifiers = item.qualifiers
      alreadyYielded[i] = true
      yield matchObj
    }
  }
}

function * doAppropriateMatches (input, items, props) {
  const inputLower = _.deburr(input ? input.toLowerCase() : null)

  const alreadyYielded = []
  yield* doOneMatch(input, inputLower, items, props, nullMatch, alreadyYielded)
  yield* doOneMatch(input, inputLower, items, props, beginningMatch, alreadyYielded)

  if (props.strategy === 'contain' || props.strategy === 'fuzzy') {
    yield* doOneMatch(input, inputLower, items, props, anywhereMatch, alreadyYielded)
  }

  if (props.strategy === 'fuzzy') {
    yield* doOneMatch(input, inputLower, items, props, fuzzyMatch, alreadyYielded)
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
