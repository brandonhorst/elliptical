/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import {createElement, Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  *_handleParse(input, options, parse) {
    let successfulChildCount = 0

    for (let child of this.props.children) {
      let childWorked = false
      let completed = false
      const iterator = parse(child, input, options)
      while (true) {
        let {value, done} = iterator.next(completed)
        if (done) break
        if (value) {
          completed = yield value.update('result', result => result.set(this.props.id, result.get(child.props.id)))
          if (completed) childWorked = true
        }
      }
      if (childWorked) successfulChildCount++
      if (this.props.limit && successfulChildCount >= this.props.limit) break
    }
  }
}
