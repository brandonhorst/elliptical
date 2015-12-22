import _ from 'lodash'
import {Source} from 'lacona-phrase'

export default class Map extends Source {
  observe () {
    return this.props.children[0]
  }

  onCreate () {
    this.onUpdate()
  }

  trigger (...args) {
    this.source.trigger(...args)
  }

  onUpdate () {
    const data = _.map(this.source.data, this.props.function)
    this.setData(data)
  }
}
