/** @jsx createElement */
import createElement from '../element'
import { substrings } from '../string-utils'

function describe ({props}) {
  return <raw func={(input) => filterInput(input, props)} limit={props.limit} />
}

function * filterInput (input, props) {
  for (let stringPart of substrings(input || '', props)) {
    if (!props.filter || props.filter(stringPart)) {
      yield {
        words: [{text: stringPart, input: true}],
        result: stringPart,
        remaining: input.substring(stringPart.length),
        score: 0.1 + (1 / (stringPart.length + 2))
      }
    }
  }
}

export default {describe}
