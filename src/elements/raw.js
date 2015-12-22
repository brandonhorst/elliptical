import _ from 'lodash'
import {Phrase} from 'lacona-phrase'

export class Raw extends Phrase {
  static defaultProps = {
    compute () { return [] }
  };

  * _handleParse (input, options) {
    let successes = 0

    for (let output of this.props.function(input.text)) {
      let success = false

      const modification = {
        result: output.result,
        score: output.score || 1,
        text: output.remaining,
        words: input.words.concat(
          _.map(output.words, word => _.assign(word, {
            argument: input.currentArgument,
            category: this.props.category
          }))
        )
      }

      if (this.props.limit) modification.callbacks = input.callbacks.concat(() => success = true)

      yield _.assign({}, input, modification)

      if (this.props.limit) {
        if (success) successes++
        if (this.props.limit <= successes) break
      }
    }
  }
}
