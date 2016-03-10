/** @jsx createElement */
import createElement from '../element'

function describe ({props, children}) {
  const inbound = props.inbound ? (option) => {
    props.inbound(option)
    return option
  } : undefined

  const outbound = props.outbound ? (option) => {
    props.outbound(option)
    return option
  } : undefined

  return (
    <map inbound={inbound} outbound={outbound}>
      {children[0]}
    </map>
  )
}

export default {describe}
