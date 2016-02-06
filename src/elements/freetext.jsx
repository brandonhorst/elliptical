/** @jsx createElement */
import { Phrase, createElement } from 'lacona-phrase'
import { substrings } from '../string-utils'

export class Freetext extends Phrase {
  static defaultProps = {
    filter () {
      return true
    },
    splitOn: '',
    consumeAll: false
  };

  * filter (input) {
    const substringOpts = {
      splitOn: this.props.splitOn,
      noSplit: this.props.consumeAll,
      reverse: this.props.greedy
    }
    
    for (let stringPart of substrings(input, substringOpts)) {
      if (this.props.filter(stringPart)) {
        yield {
          words: [{text: stringPart, input: true}],
          result: stringPart,
          remaining: input.substring(stringPart.length),
          score: 0.1 + (1 / (stringPart.length + 2))
        }
      }
    }
  }

  describe () {
    return <raw function={this.filter.bind(this)} limit={this.props.limit} />
  }
}
