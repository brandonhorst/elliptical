import _ from 'lodash'

export default class SourceManager {
  constructor ({update = () => {}}) {
    this._sources = []
    this.update = update
  }

  _createSource (descriptor) {
    const instance = new descriptor.Constructor()
    instance.props = _.defaults(descriptor.props || {}, descriptor.Constructor.defaultProps || {})

    instance.data = {}
    instance.__dataVersion = 0
    instance.__subscribers = 0
    instance.setData = newData => {
      _.merge(instance.data, newData)
      instance.__dataVersion++
      this.update()
    }
    instance.replaceData = newData => {
      instance.data = newData
      instance.__dataVersion++
      this.update()
    }

    if (instance.onCreate) instance.onCreate()

    this._sources.push({instance, descriptor: descriptor})
    return instance
  }

  getSource (descriptor) {
    let possibleSource
    if (!descriptor.Constructor.preventSharing) {
      possibleSource = _.find(this._sources, (source) => _.isEqual(descriptor, source.descriptor))
    }

    if (possibleSource) {
      return possibleSource.instance
    } else {
      return this._createSource(descriptor)
    }
  }

  removeSource (descriptor) {
    const index = _.findIndex(this._sources, (source) => _.isEqual(descriptor, source.descriptor))
    this._sources.splice(index, 1)
  }

  activate () {
    _.chain(this._sources)
      .filter(source => source.instance.onActivate)
      .forEach(source => source.instance.onActivate())
      .value()
  }

  deactivate () {
    _.chain(this._sources)
      .filter(source => source.instance.onDeactivate)
      .forEach(source => source.instance.onDeactivate())
      .value()
  }
}
