import _ from 'lodash'
// import {handleString} from '../input-option'
import {Phrase} from 'lacona-phrase'

export default class Value extends Phrase {
  *_handleParse(input, options) {
    let successes = 0

    // // TODO this is **super** WET
    // if (input.text === '') {
    //   for (let output of this.props.suggest()) {
    //     let success = false
    //
    //     const modification = {
    //       result: output.value,
    //       score: output.score || 1
    //     }
    //
    //     if (this.props.limit) modification.callbacks = input.callbacks.concat(() => success = true)
    //
    //     const word = {
    //       text: output.text,
    //       input: false,
    //       argument: input.currentArgument,
    //       category: this.props.category
    //     }
    //
    //     modification.words = input.words.concat(word)
    //
    //     yield _.assign({}, input, modification)
    //
    //     if (this.props.limit) {
    //       if (success) successes++
    //       if (this.props.limit <= successes) break
    //     }
    //   }
    // } else {
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

        yield _.assign({}, input, modification)

        if (this.props.limit) {
          if (success) successes++
          if (this.props.limit <= successes) break
        }
      // }
    }
  }
}

Value.defaultProps = {
  compute: () => []
}
