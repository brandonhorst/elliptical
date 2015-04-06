/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import {reconcile} from '../reconcile'
import parse from '../parse'

export default class Choice extends Phrase {
  *_handleParse(input, options) {
    let successes = 0
    let scoredOutputs = []
    this.childPhrases = reconcile({descriptor: this.props.children, phrase: this.childPhrases, options})

    for (let [childDescription, childPhrase] of _.zip(this.props.children, this.childPhrases)) {
      let success = false

      for (let output of parse({phrase: childPhrase, input, options})) {
        yield _.assign({}, output, {
          callbacks: output.callbacks.concat(() => success = true),
          result: this.props.value || output.result
        })
      }

      if (success) successes++
      if (this.props.limit <= successes) break
    }
  }
}

Choice.defaultProps = {limit: 100}

        /*if (this.props.ordered) {
          const obj = {output, childDescription}
          const index = _.sortedLastIndex(scoredOutputs, obj, obj => -obj.output.score)
          scoredOutputs.splice(index, 0, obj)
        } else {


    if (this.props.ordered) {
      const childSet = new Set()

      for (let {output, childDescription} of scoredOutputs) {
        let success = false

        yield _.assign({}, output, {
          callbacks: output.callbacks.concat(() => success = true),
          result: this.props.value || output.result
        })

        if (success) childSet.add(childDescription)
        if (this.props.limit <= childSet.size) break
      }
    }*/
