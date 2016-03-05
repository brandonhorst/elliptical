import element from '../element'
import { substrings } from '../string-utils'

function describe ({props: {
  limit,
  filter = () => true,
  splitOn = '',
  consumeAll = false,
  greedy = false
}}) {
  return <raw
    func={input => {
      return filterInput(input, {limit, splitOn, consumeAll, filter, greedy})
    }}
    limit={limit} />
}

function * filterInput (input, {limit, splitOn, consumeAll, filter, greedy}) {
  const substringOpts = {splitOn, noSplit : consumeAll, reverse: greedy}
  
  for (let stringPart of substrings(input, substringOpts)) {
    if (filter(stringPart)) {
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