/** @jsx createElement */
import _ from 'lodash'
import { EventEmitter } from 'events'
import { parse } from './parse'
import { reconcile } from './reconcile'
import { LaconaError } from './error'
import SourceManager from './source-manager'

function from (i) {const a = []; for (let x of i) a.push(x); return a}

const optionDefaults = {
  text: '',
  words: [],
  callbacks: []
}

export function createOption (options) {
  return _.defaults(options, optionDefaults)
}

function normalizeOutput (option) {
  const output = _.pick(option, ['words', 'score', 'result'])
  return output
}

export class Parser extends EventEmitter {
  constructor ({langs = ['default'], grammar, extensions = []} = {}) {
    super()

    this.langs = langs
    this.grammar = grammar
    this.extensions = extensions
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

  _getReconcileParseOptions ({isReparse = false} = {}) {
    return {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this),
      sourceManager: this._sourceManager,
      isReparse
    }
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

  * parse (inputString, isReparse = false) {
    if (!_.isString(inputString)) {
      throw new LaconaError('lacona parse input must be a string')
    }

    const input = createOption({text: inputString})
    this.reconcile()

    const options = this._getReconcileParseOptions({isReparse})
    for (let output of parse({phrase: this._phrase, input, options})) {
      if (!output.text) {
        // call each callback (used for limiting)
        output.callbacks.forEach(callback => callback())
        yield normalizeOutput(output)
      }
    }
  }

  parseArray (inputString, isReparse = false) {
    return from(this.parse(inputString, isReparse))
  }
}
