/** @jsx createElement */
import {Phrase, createElement} from 'lacona-phrase'
import split from 'smart-split'

function* substrings (input, {splitOn, noSplit}) {
  if (noSplit) {
    yield input
    return
  }

  let inputs = split(input, splitOn)
  for (let i = 0; i < inputs.length; i += 2) {
    yield inputs.slice(0, i + 1).join('')
  }
}

export default class Freetext extends Phrase {

  *validate (input) {
    for (let stringPart of substrings(input, {splitOn: this.props.splitOn, noSplit: this.props.consumeAll})) {
      if (this.props.validate(stringPart)) {
        yield {
          words: [{text: stringPart, input: true}],
          value: stringPart,
          remaining: input.substring(stringPart.length),
          score: 0.1 + (1 / (stringPart.length + 2))
        }
      }
    }
  }

  describe() {
    return <value compute={this.validate.bind(this)} limit={this.props.limit} />
  }
}
Freetext.defaultProps = {
  validate() {return true},
  splitOn: '',
  consumeAll: false
}
