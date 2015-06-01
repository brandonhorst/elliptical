/** @jsx createElement */
import _ from 'lodash'
import {match} from '../fuzzy'
import {createElement, Phrase} from 'lacona-phrase'

export default class Decorator extends Phrase {
  suggest() {
    return [{suggestion: this.props.text, score: 1}]
  }

  compute(input) {
    return [{
      words: [{text: this.props.text, input: false}],
      remaining: input,
      score: 1
    }]
  }

  describe() {
    return <value compute={this.compute.bind(this)} suggest={this.suggest.bind(this)} />
  }
}
