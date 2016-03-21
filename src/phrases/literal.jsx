/** @jsx createElement */
import _ from 'lodash'
import {match} from '../match'
import createElement from '../element'


function compute (input, text, strategy) {
  if (text == null) return []

  const matchObj = match({input, text, strategy})
  if (matchObj) {
    return [matchObj]
  } else {
    return []
  }
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

function describe ({props}) {
  props = _.defaults({}, props, {
    text: '',
    decorate: false,
    allowInput: true,
    strategy: 'start'
  })

  if (props.decorate) {
    if (props.allowInput) {
      return (
        <choice>
          <literal text={props.text} strategy={props.strategy} />
          <raw func={(input) => decorateFunc(input, props.text)} />
        </choice>
      )
    } else {
      return <raw func={(input) => decorateFunc(input, props.text)} />
    }
  } else {
    return <raw
      func={(input) => compute(input, props.text, props.strategy)}
      category={props.category} />
  }
}

export default {describe}
