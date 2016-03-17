/** @jsx createElement */

import _ from 'lodash'
import createElement from '../element'

function textIsEmpty (option) {
  return option.text === '' || option.text == null
}

function callCallbacks (option) {
  _.forEach(option.callbacks, (callback) => callback())
}

function addCallbacks (option) {
  return _.assign({}, option, {callbacks: []})
}

function removeCallbacks (option) {
  const newOption = _.clone(option)
  delete newOption.callbacks
  return newOption
}

function describe ({children}) {
  return (
    <map inbound={addCallbacks} outbound={removeCallbacks} option>
      <tap outbound={callCallbacks} option>
        <filter outbound={textIsEmpty} option>
          {children}
        </filter>
      </tap>
    </map>
  )
}

export default {describe}
