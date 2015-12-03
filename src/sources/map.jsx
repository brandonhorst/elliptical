/** @jsx createElement */
import _ from 'lodash'
import {createElement, Source} from 'lacona-phrase'

export default class Map extends Source {
  source () {
    return {data: this.props.children[0]}
  }

  onCreate () {
    this.onUpdate()
  }

  trigger (...args) {
    this.sources.data.trigger(...args)
  }

  onUpdate () {
    const data = _.map(this.sources.data.data, this.props.function)
    this.replaceData(data)
  }
}
