import _ from 'lodash'
import {getRealProps, getConstructor, instantiate, addSource, removeSource} from './component'

export default class SourceManager {
  constructor ({update = () => {}}) {
    this._sourceMaps = []
    this._fetchObjects = []
    this.update = update
    this.existCount = 0;
  }

  _triggerSourceUpdate (instance) {
    _.forEach(this._sourceMaps, existingSource => {
      if (existingSource.instance.source === instance) {
        if (existingSource.instance.onUpdate) existingSource.instance.onUpdate()
      }
    })
    instance.__dataVersion++
    this.update()
  }

  _createSource (descriptor) {
    const Constructor = getConstructor({Constructor: descriptor.Constructor, type: 'source'})
    const props = getRealProps({descriptor, Constructor: descriptor.Constructor})
    const instance = instantiate({Constructor, props})

    instance.__dataVersion = 0
    instance.__subscriberCount = 0
    instance.__isCreating = true

    instance.setData = newData => { // setData during onCreate() doesn't trigger source Update
      instance.data = newData
      if (!instance.__isCreating) {
        this._triggerSourceUpdate(instance)
      }
    }

    addSource({component: instance, options: {sourceManager: this}})

    this._sourceMaps.push({instance, descriptor})

    if (instance.onCreate) instance.onCreate()

    instance.__isCreating = false

    return instance
  }

  _destroySource (source) {
    if (source.onDestroy) source.onDestroy()
    removeSource({component: source, options: {sourceManager: this}})

    const index = _.findIndex(this._sourceMaps, (sourceMap) => source === sourceMap.instance)
    this._sourceMaps.splice(index, 1)
  }

  subscribe (descriptor) {
    const possibleSourceMap = _.find(this._sourceMaps, (source) => _.isEqual(descriptor, source.descriptor))

    let source
    if (possibleSourceMap) {
      source = possibleSourceMap.instance
    } else {
      source = this._createSource(descriptor)
    }

    source.__subscriberCount++

    return source
  }

  unsubscribe (source) {
    source.__subscriberCount--
    if (source.__subscriberCount === 0) {
      this._destroySource(source)
    }
  }
  
  getDataVersion (source) {
    return source.__dataVersion
  }

  activate () {
    _.chain(this._sourceMaps)
      .filter(source => source.instance.onActivate)
      .forEach(source => source.instance.onActivate())
      .value()
  }

  deactivate () {
    _.chain(this._sourceMaps)
      .filter(source => source.instance.onDeactivate)
      .forEach(source => source.instance.onDeactivate())
      .value()
  }
}
