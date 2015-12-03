import _ from 'lodash'
import {Source} from 'lacona-phrase'

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
    const data = this.props.function(this.sources.data.data)
    this.replaceData(data)
  }
}
