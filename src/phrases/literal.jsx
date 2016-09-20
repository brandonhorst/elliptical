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
    strategy: 'start',
    limitDecoration: true
  })

  if (props.decorate) {
    if (props.allowInput) {
      return (
        <choice limit={props.limitDecoration ? 1 : undefined}>
          <literal text={props.text} strategy={props.strategy} />
          <raw func={(option) => decorateFunc(option.text, props.text)} />
        </choice>
      )
    } else {
      return <raw func={(option) => decorateFunc(option.text, props.text)} />
    }
  } else {
    return <raw func={(option) => compute(option.text, props.text, props.strategy)} />
  }
}

export default {describe}
