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
    const data = this.props.function(this.source.data)
    this.replaceData(data)
  }
}
