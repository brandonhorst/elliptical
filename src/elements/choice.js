/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import {createElement, Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  *_handleParse(input, options, parse) {
    let successes = 0

    for (let child of this.props.children) {
      let success = false

      for (let output of parse(child, input, options)) {
        yield output
          .update('result', result => result.set(this.props.id, result.get(child.props.id)))
          .update('callbacks', callbacks => callbacks.push(() => success = true))
      }

      if (success) successes++
      if (this.props.limit && this.props.limit <= successes) break
    }
  }
}
