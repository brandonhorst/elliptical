/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import {reconcile} from '../reconcile'

export default class Choice extends Phrase {
  *_handleParse(input, options) {
    let successes = 0
    let scoredOutputs = []
    if (this.props.children && this.props.children.length > 0) {
      this.childPhrases = reconcile({descriptor: this.props.children, phrase: this.childPhrases, options})

      for (let childPhrase of this.childPhrases) {
        let success = false

        for (let output of parse({phrase: childPhrase, input, options})) {
          const newResult = this.props.value || (
            childPhrase.props.id != null ?
            {[childPhrase.props.id]: output.result} :
            output.result
          )

          const modifications = {result: newResult}
          if (this.props.limit) modifications.callbacks = output.callbacks.concat(() => success = true)

          yield _.assign({}, output, modifications)
        }

        if (this.props.limit) {
          if (success) successes++
          if (this.props.limit <= successes) break
        }
      }
    }
  }
}
