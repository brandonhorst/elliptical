/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import reconcile from '../reconcile'

export default class Choice extends Phrase {

  getValue(results) {

  }

  *_handleParse(input, options) {
    let successes = 0
    this.stores = reconcile({descriptor: this.props.children, store: this.stores, options})

    for (let [child, store] of _.zip(this.props.children, this.stores)) {
      let success = false

      for (let output of parse({store: store, input, options})) {
        yield output
          .update('callbacks', callbacks => callbacks.push(() => success = true))
          .update('result', result => this.props.value || result)
      }

      if (success) successes++
      if (this.props.limit && this.props.limit <= successes) break
    }
  }
}
