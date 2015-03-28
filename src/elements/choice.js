/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import reconcile from '../reconcile'

export default class Choice extends Phrase {
  *_handleParse(input, options) {
    let successes = 0
    let scoredOutputs = []
    this.stores = reconcile({descriptor: this.props.children, store: this.stores, options})

    for (let [child, store] of _.zip(this.props.children, this.stores)) {
      let success = false

      for (let output of parse({store: store, input, options})) {
        if (this.props.ordered) {
          const obj = {output, child}
          const index = _.sortedIndex(scoredOutputs, obj, obj => obj.output.score)
          scoredOutputs.splice(index, 0, obj)
        } else {
          if (this.props.limit || this.props.value) {
            output = _.assign({}, output, {
              callbacks: output.callbacks.concat(() => success = true),
              result: this.props.value || output.result
            })
          }
          yield output
        }
      }

      if (success) successes++
      if (this.props.limit && this.props.limit <= successes) break
    }

    if (this.props.ordered) {
      const childSet = new Set()

      for (let {output, child} of scoredOutputs) {
        let success = false

        if (this.props.limit || this.props.value) {
          output = _.assign({}, output, {
            callbacks: output.callbacks.concat(() => success = true),
            result: this.props.value || output.result
          })
        }
        yield output

        if (success) childSet.add(child)
        if (this.props.limit && this.props.limit <= childSet.size) break
      }
    }
  }
}
