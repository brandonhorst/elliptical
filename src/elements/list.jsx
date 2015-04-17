/** @jsx createElement */
import _ from 'lodash'
import {sort} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'


export default class List extends Phrase {
  itemify (item) {
    const trueItem = _.isString(item) ? {text: item} : item
    if (!_.isUndefined(this.props.value)) trueItem.value = this.props.value
    return trueItem
  }

  *compute (input) {
    // first check for exact matches
    const trueItems = _.map(this.props.items, this.itemify.bind(this))

    for (let {text, value} of trueItems) {
      if (_.startsWith(input.toLowerCase(), text.toLowerCase())) {
        yield {
          remaining: input.slice(text.length),
          words: [{text, input: true}],
          value
        }
      }
    }

    for (let result of sort(input, trueItems)) {
      result.remaining = ''
      yield result
    }
  }

  *suggest (input) {
    for (let item of this.props.items) {
      const {text, value} = this.itemify(item)
      yield {suggestion: text, value}
    }
  }

  describe () {
    if (this.props.fuzzy) {
      return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} limit={this.props.limit} />
    } else {
      const literals = _.chain(this.props.items)
        .map(this.itemify.bind(this))
        .map(item => <literal text={item.text} value={item.value} />)
        .value()

      return (
        <choice limit={this.props.limit} value={this.props.value}>
          {literals}
        </choice>
      )
    }
  }
}
