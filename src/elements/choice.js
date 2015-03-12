/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import {createElement, Phrase} from 'lacona-phrase'
import parse from '../parse'
import reconcile from '../reconcile'

export default class Choice extends Phrase {
  *_handleParse(input, options) {
    let successes = 0
    this.stores = reconcile({descriptor: this.props.children, store: this.store, options})

    for (let [child, store] of _.zip(this.props.children, this.stores)) {
      let success = false

      for (let output of parse({store: store, input, options})) {
        yield output
          .update('result', result => result.set(this.props.id, result.get(child.props.id)))
          .update('callbacks', callbacks => callbacks.push(() => success = true))
      }

      if (success) successes++
      if (this.props.limit && this.props.limit <= successes) break
    }
  }
}
