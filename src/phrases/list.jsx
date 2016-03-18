/** @jsx createElement */
import _ from 'lodash'
import createElement from '../element'
import { match } from '../string-match'

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
  return _.isString(item) ? {text: item} : item
}

function * doMatch (input, items, props) {
  for (let item of items) {
    const matchObj = match({input, text: item.text, strategy: props.strategy})
    if (matchObj) {
      matchObj.result = item.value
      matchObj.qualifiers = item.qualifiers
      yield matchObj
    }
  }
}

function * compute (input, items, props) {
  const resultIterator = doMatch(input, items, props)
  let finalIterator = resultIterator
  if (props.strategy !== 'start') {
    // TODO - this could be optimized
    //  Right now it is going to do fuzzy matching for every single item
    //  much of this processing could be eliminated if it ran the
    //  non-fuzzy (score 1) parses first, and then did the fuzzy (score 0.5)
    //  parses
    const sortedResults = _.chain(Array.from(resultIterator))
      .sortBy(({score}) => -score)
      .value()

    finalIterator = sortedResults
  }

  if (props.value != null) {
    for (let output of finalIterator) {
      yield _.assign({}, output, {result: props.value})
    }
  } else {
    yield * finalIterator
  }
}
