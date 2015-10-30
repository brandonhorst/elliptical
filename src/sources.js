import _ from 'lodash'

export default class SourceManager {
  constructor ({update = () => {}}) {
    this._sources = []
    this.update = update
  }

  _triggerSourceUpdate (instance) {
    _.forEach(this._sources, existingSource => {
      if (_.includes(existingSource.instance.sources, instance)) {
        if (existingSource.instance.onUpdate) existingSource.instance.onUpdate()
      }
    })
    instance.__dataVersion++
    this.update()
  }

  _createSource (descriptor) {
    const instance = new descriptor.Constructor()
    instance.props = _.defaults(descriptor.props || {}, descriptor.Constructor.defaultProps || {})

    instance.data = {}
    instance.__dataVersion = 0
    instance.__subscribers = 0
    instance.setData = newData => {
      _.merge(instance.data, newData)
      this._triggerSourceUpdate(instance)
    }
    instance.replaceData = newData => {
      instance.data = newData
      this._triggerSourceUpdate(instance)
    }

    this.sourceInstance(instance)

    this._sources.push({instance, descriptor: descriptor})

    if (instance.onCreate) instance.onCreate()

    return instance
  }

  _getSource (descriptor) {
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

  _removeSource (descriptor) {
    const index = _.findIndex(this._sources, (source) => _.isEqual(descriptor, source.descriptor))
    this._sources.splice(index, 1)
  }

  sourceInstance (object) {
    object.__sources = {}

    if (object.source) {
      const sourceDescriptors = object.source()

      const sources = _.mapValues(sourceDescriptors, (descriptor, name) => {
        const source = this._getSource(descriptor)
        source.__subscribers++
        object.__sources[name] = {source, lastVersion: 0}
        return source
      })

      object.sources = sources
    }
  }

  unsourceInstance (object) {
    _.forEach(object.__sources, ({source, descriptor}) => {
      source.__subscribers--
      if (source.__subscribers === 0 && source.onDestroy) {
        source.onDestroy()
        this._removeSource(descriptor)
      }
    })
    object.__sources = {}
  }

  sourceChanged (object) {
    return _.some(object.__sources, obj => obj.lastVersion !== obj.source.__dataVersion)
  }

  markSourceUpToDate (object) {
    _.forEach(object.__sources, obj => {
      obj.lastVersion = obj.source.__dataVersion
    })
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
