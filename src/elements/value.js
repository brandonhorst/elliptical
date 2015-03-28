import _ from 'lodash'
// import {handleString} from '../input-option'
import {Phrase} from 'lacona-phrase'

export default class Value extends Phrase {
  static get defaultProps() {return {suggest: () => [], compute: () => []}}

  *_handleParse(input, options) {
    // if this has a category use that, else the last category on the stack
    let category = this.props.category
    if (_.isUndefined(category)) {
      const stackEntry = _.findLast(input.stack, entry => !_.isUndefined(entry.category))
      category = stackEntry ? stackEntry.category : null
    }

    let join = this.props.join
    if (_.isUndefined(join)) {
      const stackEntry = _.findLast(input.stack, entry => !_.isUndefined(entry.join))
      join = stackEntry ? stackEntry.join : false
    }

    let successes = 0

    // TODO this is **super** WET
    if (input.text === '') {
      for (let output of this.props.suggest()) {
        const modification = {}
        let success = false
        const word = {string: output.suggestion, category, input: false}

        if (_.isEmpty(input.suggestion) || (_.isEmpty(input.completion) && join)) {
          modification.suggestion = input.suggestion.concat(word)
        } else {
          modification.completion = input.completion.concat(word)
        }
        modification.result = output.value
        modification.score = output.score

        if (this.props.limit) modification.callbacks = input.callbacks.concat(() => success = true)
        yield _.assign({}, input, modification)
        if (success) successes++
        if (this.props.limit && this.props.limit <= successes) break
      }
    } else {
      for (let output of this.props.compute(input.text)) {
        const modification = {}
        let success = false
        const trueWords = output.words.map(word => ({string: word.text, category, input: word.input}))

        if (_.isEmpty(input.suggestion) && _.every(output.words, 'input')) {
          modification.match = input.match.concat(trueWords)
        } else {
          modification.suggestion = input.suggestion.concat(trueWords)
        }
        modification.result = output.value
        modification.score = output.score
        modification.text = output.remaining

        if (this.props.limit) modification.callbacks = input.callbacks.concat(() => success = true)
        yield _.assign({}, input, modification)
        if (success) successes++
        if (this.props.limit && this.props.limit <= successes) break
      }
    }
  }
}
