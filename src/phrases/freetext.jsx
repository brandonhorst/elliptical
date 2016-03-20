/** @jsx createElement */
import createElement from '../element'
import { substrings } from '../string-utils'

function describe ({props}) {
  return <raw func={(input) => filterInput(input, props)} limit={props.limit} />
}

function * filterInput (input, props) {
  for (let substring of substrings(input || '', props)) {
    if (!props.filter || props.filter(substring)) {
      const score = props.greedy
        ? 0.1 + (1 - (1 / substring.length))
        : 0.1 + (1 / substring.length)
      yield {
        words: [{text: substring, input: true}],
        result: substring,
        remaining: input.substring(substring.length),
        score
      }
    }
  }
}

export default {describe}
