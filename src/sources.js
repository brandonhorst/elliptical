import _ from 'lodash'

export default class SourceManager {
  constructor ({update = () => {}}) {
    this._sources = []
    this.update = update
  }

  _createSource (sourceDescriptor) {
    const instance = new sourceDescriptor.Constructor()
    instance.props = _.defaults(sourceDescriptor.props || {}, sourceDescriptor.Constructor.defaultProps || {})

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

    this._sources.push({instance, descriptor: sourceDescriptor})
    return instance
  }

  getSource (sourceDescriptor) {
    const possibleSource = _.find(this._sources, ({descriptor}) => _.isEqual(descriptor, sourceDescriptor))
    if (possibleSource) {
      return possibleSource.instance
    } else {
      return this._createSource(sourceDescriptor)
    }
  }

  removeSource (sourceDescriptor) {
    const index = _.findIndex(this._sources, ({descriptor}) => _.isEqual(descriptor, sourceDescriptor))
    this._sources.splice(index, 1)
  }

  activate () {
    _.chain(this._sources)
      .filter(source => source.instance.onActivate)
      .forEach(source => source.instance.onActivate())
      .value()
  }
}
