import _ from 'lodash'
// import {handleString} from '../input-option'
import {Phrase} from 'lacona-phrase'
import stackFind from '../stackfind.js'

export default class Value extends Phrase {
  *_handleParse(input, options) {
    // if this has a category use that, else the last category on the stack
    // const category = stackFind(input.stack, 'category', this.props.category, null)
    // const qualifier = stackFind(input.stack, 'qualifier', this.props.qualifier, null)
    // const descriptors = _.chain(input.stack).map('descriptor').filter().value()

    let successes = 0

    // TODO this is **super** WET
    if (input.text === '') {
      for (let output of this.props.suggest()) {
        let success = false

        const modification = {
          result: output.value,
          score: output.score || 1
        }

        if (this.props.limit) modification.callbacks = input.callbacks.concat(() => success = true)

        const word = {
          text: output.text,
          // category,
          input: false,
          argument: input.currentArgument,
          category: this.props.category
          // qualifier,
          // descriptors
        }

        modification.words = input.words.concat(word)

        // if (_.isEmpty(input.suggestion)) {
        //   modification.suggestion = input.suggestion.concat(word)
        // } else {
        //   modification.completion = input.completion.concat(word)
        // }
        //
        yield _.assign({}, input, modification)

        if (this.props.limit) {
          if (success) successes++
          if (this.props.limit <= successes) break
        }
      }
    } else {
      for (let output of this.props.compute(input.text)) {
        let success = false

        const modification = {
          result: output.value,
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
        //
        // const trueWords = output.words.map(word => ({
        //   text: word.text,
        //   // category,
        //   input: word.input
        //   // qualifier: word.qualifier || qualifier,
        //   // descriptors
        // }))

        // modification.words = output.words

        // if (_.isEmpty(input.suggestion) && (_.every(output.words, 'input') || output.decorator)) {
        //   modification.match = input.match.concat(trueWords)
        // } else {
        //   modification.suggestion = input.suggestion.concat(trueWords)
        // }

        yield _.assign({}, input, modification)

        if (this.props.limit) {
          if (success) successes++
          if (this.props.limit <= successes) break
        }
      }
    }
  }
}

Value.defaultProps = {
  suggest: () => [],
  compute: () => []
}
