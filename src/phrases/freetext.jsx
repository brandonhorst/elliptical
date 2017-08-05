/** @jsx createElement */
import createElement from '../element'
import { substrings } from '../utils'

function describe ({props}) {
  return <raw func={(option) => filterInput(option.text, props)} limit={props.limit} />
}

function * filterInput (input, props) {
  for (let substring of substrings(input || '', props)) {
    if (!props.filter || props.filter(substring)) {
      const score = props.greedy
        ? 0.1 + (1 - (1 / (substring.length + 1)))
        : 0.1 + (1 / (substring.length + 1))
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
