import _ from 'lodash'
import {getRealProps, getConstructor, instantiate} from './descriptor'

export default class SourceManager {
  constructor ({update = () => {}}) {
    this._sources = []
    this._fetchObjects = []
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

  _createSource (descriptor, {fetch, object}) {
    const Constructor = getConstructor({Constructor: descriptor.Constructor, type: 'source'})
    const props = getRealProps({descriptor, Constructor: descriptor.Constructor})
    const instance = instantiate({Constructor, props})

    instance.__dataVersion = 0
    instance.__subscribers = 0
    instance.__isCreating = true

    instance.setData = newData => { // setData during onCreate() doesn't trigger source Update
      instance.data = newData
      if (!instance.__isCreating) {
        this._triggerSourceUpdate(instance)
      }
    }

    this.observeSourceInstance(instance)

    this._sources.push({instance, descriptor})

    if (instance.onCreate) instance.onCreate()

    instance.__isCreating = false

    return instance
  }

  _getSource (descriptor, {fetch = false, object} = {}) {
    const possibleSource = _.find(this._sources, (source) => _.isEqual(descriptor, source.descriptor))

    if (possibleSource) {
      return possibleSource.instance
    } else {
      return this._createSource(descriptor, {fetch, object})
    }
  }

  _removeSource (descriptor) {
    const index = _.findIndex(this._sources, (source) => _.isEqual(descriptor, source.descriptor))
    this._sources.splice(index, 1)
  }

  observeSourceInstance (object) {
    if (object.observe) {
      const sourceDescriptor = object.observe()
      if (sourceDescriptor) {
        const source = this._getSource(sourceDescriptor)
        source.__subscribers++
        source.__descriptor = sourceDescriptor
        object.__lastSourceVersion = 0

        object.source = source
      }
    }
  }

  _removeSubscription (source) {
    source.__subscribers--
    if (source.__subscribers === 0) {
      if (source.onDestroy) source.onDestroy()
      this._removeSource(source.__descriptor)
    }
  }

  observeUnsourceInstance (object) {
    if (object.source) {
      this.observeUnsourceInstance(object.source)
      this.fetchUnsourceInstance(object.source)
      this._removeSubscription(object.source)
      delete object.source
    }
  }

  fetchSourceInstance (object, input) {
    if (object.fetch) {
      const sourceDescriptor = object.fetch(input)
      if (sourceDescriptor) {
        const source = this._getSource(sourceDescriptor, {fetch: true, object})
        this._fetchObjects.push({object, input})
        source.__subscribers++
        source.__descriptor = sourceDescriptor
        object.__fetchSources[input] = {
          source,
          lastVersion: 0
        }
      }
    }
  }

  fetchUnsourceInstance (object, input) {
    if (object.fetch && object.__fetchSources && object.__fetchSources[input]) {
      const source = object.__fetchSources[input]
      this.observeUnsourceInstance(source)
      this.fetchUnsourceInstance(source)
      this._removeSubscription(source)

      delete object.__fetchSources[input]
      delete object.__fetchDescribedPhrases[input]
    }
  }

  sourceChanged (object) {
    if (!object.source) return false
    return object.__lastSourceVersion !== object.source.__dataVersion
  }

  fetchSourceChanged (object, index) {
    if (!object.__fetchSources[index]) return false
    return object.__fetchSources[index].version !== object.__fetchSources[index].source.__dataVersion
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

    _.forEach(this._fetchObjects, ({object, input}) => this.fetchUnsourceInstance(object, input))
    this._fetchObjects = []
  }
}
