import _ from 'lodash'
import asyncEach from 'async-each'
import {Phrase} from 'lacona-phrase'

export default class Choice extends Phrase {
  constructor(props, Phrase) {
    this.children = _.map(props.children, child => new Phrase(child))
  }

  _handleParse(input, options) {
    return _.chain(_.map(this.children, child => {
      return _.chain(child.parse(input, options))
        .map(output => output.update('result', result => result.set(this.props.id, result.get(child.element.props.id))))
        .value()
    }))
    .flatten()
    .value()
  }
}
