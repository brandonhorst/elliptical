/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { match } from '../string-match'

export class List extends Phrase {
  itemify (item) {
    return _.isString(item) ? {text: item} : item
  }

  * doMatch (items, input) {
    for (let item of items) {
      for (let output of match({input, text: item.text, fuzzy: this.props.fuzzy})) {
        output.result = item.value
        output.qualifiers = item.qualifiers
        yield output
      }
    }
  }

  * compute (items, input) {
    const resultIterator = this.doMatch(items, input)
    if (this.props.fuzzy) {
      // TODO - this could be optimized
      //  Right now it is going to do fuzzy matching for every single item
      //  much of this processing could be eliminated if it ran the
      //  non-fuzzy (score 1) parses first, and then did the fuzzy (score 0.5)
      //  parses
      const sortedResults = _.chain(Array.from(resultIterator))
        .sortBy(({score}) => -score)
        .value()

      yield* sortedResults
    } else {
      yield* resultIterator
    }


      // if (_.startsWith(input.toLowerCase(), item.text.toLowerCase())) {
      //   const qualifiers = item.qualifiers
      //     ? item.qualifiers
      //     : item.qualifier ? [item.qualifier] : []
      //
      //   yield {
      //     remaining: input.slice(item.text.length),
      //     words: [{text: item.text, input: true}],
      //     result: item.value,
      //     qualifiers
      //   }
      // } else {
      //   if (this.props.fuzzy) {
      //     itemsForFuzzy.push(item)
      //   }
      // }

    // if (this.props.fuzzy) {
    //   for (let result of sort(input, itemsForFuzzy)) {
    //     result.remaining = ''
    //
    //     yield result
    //   }
    // }
  }

  describe () {
    // if (this.props.fuzzy) {
    const trueItems = _.map(this.props.items, this.itemify.bind(this))

    return <raw function={this.compute.bind(this, trueItems)} limit={this.props.limit} category={this.props.category} />
    // } else {
    //   const literals = _.chain(this.props.items)
    //     .map(this.itemify.bind(this))
    //     .map(item => <literal text={item.text} value={item.value} qualifier={item.qualifier} category={this.props.category} />)
    //     .value()
    //
    //   return (
    //     <choice limit={this.props.limit} value={this.props.value}>
    //       {literals}
    //     </choice>
    //   )
    // }
  }
}
