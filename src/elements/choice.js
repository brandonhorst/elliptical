/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import {createElement, Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  *_handleParse(input, options, parse) {
    for (let child of this.props.children) {
      const iterator = parse(child, input, options)
      for (let output of iterator) {
        if (output) {
          yield output.update('result', result => result.set(this.props.id, result.get(child.props.id)))
        }
      }
    }
  }
}
