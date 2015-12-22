import _ from 'lodash'
import {getRealProps, getConstructor} from './descriptor'

export default class SourceManager {
  constructor ({update = () => {}}) {
    this._sources = []
    this.update = update
  }

  _triggerSourceUpdate (instance) {
    _.forEach(this._sources, existingSource => {
      if (existingSource.instance.source === instance) {
        if (existingSource.instance.onUpdate) existingSource.instance.onUpdate()
      }
    })
    instance.__dataVersion++
    this.update()
  }

  _createSource (descriptor) {
    const Constructor = getConstructor({Constructor: descriptor.Constructor, type: 'source'})
    const instance = new Constructor()
    const props = getRealProps({descriptor, Constructor: descriptor.Constructor})
    instance.props = props

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

    this._sources.push({instance, descriptor})

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

    if (object.observe) {
      const sourceDescriptor = object.observe()
      if (sourceDescriptor) {

        const source = this._getSource(sourceDescriptor)
        source.__subscribers++
        object.__lastSourceVersion = 0
        object.__descriptor = sourceDescriptor

        object.source = source
      }
    }
  }

  unsourceInstance (object) {
    if (object.source) {
      object.source.__subscribers--
      if (object.source.__subscribers === 0 && object.source.onDestroy) {
        object.source.onDestroy()
        this._removeSource(object.source.__descriptor)
      }
      delete object.source
    }
  }

  sourceChanged (object) {
    if (!object.source) return false
    return object.__lastSourceVersion !== object.source.__dataVersion
  }

  markSourceUpToDate (object) {
    if (object.source) {
      object.__lastSourceVersion = object.source.__dataVersion
    }
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
