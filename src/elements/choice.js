/** @jsx createElement */
import _ from 'lodash'
import asyncEach from 'async-each'
import {createElement, Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  // constructor(props, Phrase) {
  //   this.children = _.map(props.children, child => new Phrase(child))
  // }
  //
  _handleParse(input, options, parse) {
    return _.chain(_.map(this.props.children, child => {
      return _.chain(parse(child, input, options))
        .map(output => output.update('result', result => result.set(this.props.id, result.get(child.props.id))))
        .value()
    }))
    .flatten()
    .value()
  }
}
