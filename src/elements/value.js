import _ from 'lodash'
// import {handleString} from '../input-option'
import {Phrase} from 'lacona-phrase'
import stackFind from '../stackfind.js'

export default class Value extends Phrase {
  *_handleParse(input, options) {
    // if this has a category use that, else the last category on the stack
    const category = stackFind(input.stack, 'category', this.props.category, null)
    const descriptor = stackFind(input.stack, 'descriptor', this.props.descriptor, null)

    let successes = 0

    // TODO this is **super** WET
    if (input.text === '') {
      for (let output of this.props.suggest()) {
        let success = false

        const modification = {
          result: output.value,
          score: output.score || 1,
          callbacks: input.callbacks.concat(() => success = true)
        }

        const word = {
          string: output.suggestion,
          category,
          input: false,
          descriptor
        }

        if (_.isEmpty(input.suggestion)) {
          modification.suggestion = input.suggestion.concat(word)
        } else {
          modification.completion = input.completion.concat(word)
        }

        yield _.assign({}, input, modification)

        if (success) successes++
        if (this.props.limit <= successes) break
      }
    } else {
      for (let output of this.props.compute(input.text)) {
        let success = false

        const modification = {
          result: output.value,
          score: output.score || 1,
          text: output.remaining,
          callbacks: input.callbacks.concat(() => success = true),
        }

        const trueWords = output.words.map(word => ({
          string: word.text,
          category,
          input: word.input,
          descriptor: word.descriptor || descriptor
        }))

        if (_.isEmpty(input.suggestion) && _.every(output.words, 'input')) {
          modification.match = input.match.concat(trueWords)
        } else {
          modification.suggestion = input.suggestion.concat(trueWords)
        }

        yield _.assign({}, input, modification)

        if (success) successes++
        if (this.props.limit <= successes) break
      }
    }
  }
}

Value.defaultProps = {
  suggest: () => [],
  compute: () => [],
  limit: 100
}
