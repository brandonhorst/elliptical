/** @jsx createElement */
import {match} from '../string-match'
import createElement from '../element'

function compute (input, text, fuzzy) {
  if (text == null) return []

  return match({input, text, fuzzy})
}

function decorateFunc (input, text) {
  if (input == null || input === '') {
    return []
  } else {
    return [{
      words: [{text, input: false}],
      remaining: input,
      score: 1
    }]
  }
}

function describe ({props: {
  text = '',
  decorate = false,
  allowInput = true,
  fuzzy = false,
  category
}}) {
  if (decorate) {
    if (allowInput) {
      return (
        <choice>
          <literal text={text} fuzzy={fuzzy} />
          <raw func={(input) => decorateFunc(input, text)} />
        </choice>
      )
    } else {
      return <raw func={(input) => decorateFunc(input, text)} />
    }
  } else {
    return <raw
      func={(input) => compute(input, text, fuzzy)}
      category={category} />
  }
}

export default {describe}
