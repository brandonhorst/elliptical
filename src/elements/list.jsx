/** @jsx createElement */
import _ from 'lodash'
import {sort} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'


export default class List extends Phrase {
  itemify (item) {
    const trueItem = _.isString(item) ? {text: item} : item
    if (!_.isUndefined(this.props.value)) trueItem.value = this.props.value
    if (!_.isUndefined(this.props.qualifier)) trueItem.qualifier = this.props.qualifier
    return trueItem
  }

  *compute (input) {
    // first check for exact matches
    const trueItems = _.map(this.props.items, this.itemify.bind(this))

    const itemsForFuzzy = []

    for (let item of trueItems) {
      if (_.startsWith(input.toLowerCase(), item.text.toLowerCase())) {
        yield {
          remaining: input.slice(item.text.length),
          words: [{text: item.text, input: true, qualifier: item.qualifier}],
          value: item.value
        }
      } else {
        itemsForFuzzy.push(item)
      }
    }

    for (let result of sort(input, itemsForFuzzy)) {
      result.remaining = ''

      yield result
    }
  }

  *suggest (input) {
    for (let item of this.props.items) {
      yield this.itemify(item)
    }
  }

  describe () {
    if (this.props.fuzzy) {
      return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} limit={this.props.limit} category={this.props.category} />
    } else {
      const literals = _.chain(this.props.items)
        .map(this.itemify.bind(this))
        .map(item => <literal text={item.text} value={item.value} qualifier={item.qualifier} category={this.props.category} />)
        .value()

      return (
        <choice limit={this.props.limit} value={this.props.value}>
          {literals}
        </choice>
      )
    }
  }
}
