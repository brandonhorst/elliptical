/** @jsx createElement */
import _ from 'lodash'
import createElement from '../element'
import { match } from '../string-match'

export default {
  describe ({props}) {
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
    for (let output of match({input, text: item.text, fuzzy: props.fuzzy})) {
      output.result = item.value
      output.qualifiers = item.qualifiers
      yield output
    }
  }
}

function * compute (input, items, props) {
  const resultIterator = doMatch(input, items, props)
  let finalIterator = resultIterator
  if (props.fuzzy) {
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
