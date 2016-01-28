/** @jsx createElement */
import _ from 'lodash'
import { EventEmitter } from 'events'
import { parse } from './parse'
import { reconcile } from './reconcile'
import { LaconaError } from './error'
import SourceManager from './source-manager'

function from (i) {
  const a = []
  for (let x of i) {
    a.push(x)
  }
  return a
}

function callEvery (ary) {
  _.forEach(ary, callback => callback())
}

const optionDefaults = {
  text: '',
  words: [],
  qualifiers: [],
  callbacks: []
}

export function createOption (options) {
  return _.defaults(options, optionDefaults)
}

function normalizeOutput (option) {
  const output = _.pick(option, ['words', 'score', 'result', 'qualifiers', 'ellipsis'])
  return output
}

export class Parser extends EventEmitter {
  constructor ({langs = ['default'], grammar, extensions = []} = {}) {
    super()

    this.langs = langs
    this.grammar = grammar
    this.extensions = extensions
    this._oldExtensions = []
    this._finalCallbacks = []
    this._sourceManager = new SourceManager({
      update: this._maybeReparse.bind(this)
    })
  }

  _maybeReparse () {
    this.emit('update')
  }

  _getExtensions (Constructor) {
    return _.reduce(this.extensions, (acc, Extension) => {
      if (_.includes(Extension.extends, Constructor)) {
        acc.push(Extension)
      }
      return acc
    }, [])
  }

  _getSource (descriptor) {
    return this._sourceManager.getSource(descriptor)
  }

  _removeSource (descriptor) {
    this._sourceManager.removeSource(descriptor)
  }

  _getReconcileParseOptions ({extensionsChanged = false} = {}) {
    return {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this),
      sourceManager: this._sourceManager,
      enqueueCallback: this._enqueueCallback.bind(this),
      extensionsChanged,
      parses: 0
    }
  }

  _enqueueCallback (callback) {
    this._finalCallbacks.push(callback)
  }

  _reconcile (options) {
    this._phrase = reconcile({descriptor: this.grammar, phrase: this._phrase, options})
  }

  reconcile () {
    this._reconcile(this._getReconcileParseOptions())
  }

  activate () {
    this._sourceManager.activate()
  }

  deactivate () {
    this._sourceManager.deactivate()
  }

  * parse (inputString) {
    if (!_.isString(inputString)) {
      throw new LaconaError('lacona parse input must be a string')
    }

    const extensionsChanged = !_.isEqual(this._oldExtensions, this.extensions)
    if (extensionsChanged) {
      this._oldExtensions = _.clone(this.extensions)
    }

    const input = createOption({text: inputString})

    const options = this._getReconcileParseOptions({extensionsChanged})
    
    this._reconcile(options)

    for (let output of parse({phrase: this._phrase, input, options})) {
      if (!output.text) {
        callEvery(output.callbacks)
        yield normalizeOutput(output)
      }
    }
    if (global.logStatus) global.logStatus({parses: options.parses})

    callEvery(this._finalCallbacks)

    this._finalCallbacks = []
  }

  parseArray (inputString) {
    return from(this.parse(inputString))
  }
}
