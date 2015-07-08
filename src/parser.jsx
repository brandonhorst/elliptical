/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'lacona-phrase'
import {EventEmitter} from  'events'
import parse from './parse'
import {reconcile} from './reconcile'

function from(i) {const a = []; for (let x of i) a.push(x); return a}

const optionDefaults = {
  text: '',
  words: [],
  // match: [],
  // suggestion: [],
  // completion: [],
  // stack: [],
  callbacks: [],
  // path: []
}

export function createOption(options) {
  return _.defaults(options, optionDefaults)
}

function normalizeOutput (option) {
  let output = _.pick(option, ['words', 'score', 'result'])
  // const suggestion = option.suggestion
  // let newSuggestions = []
  // let i, l, lastSuggestion, oldSuggestion

  // if (suggestion.length > 0) {
  //   newSuggestions.push(_.clone(suggestion[0]))
  //   for (i = 1, l = suggestion.length; i < l; i++) {
  //     lastSuggestion = newSuggestions[newSuggestions.length - 1]
  //     oldSuggestion = _.clone(suggestion[i])
  //     if (lastSuggestion.input === oldSuggestion.input && lastSuggestion.category === oldSuggestion.category) {
  //       lastSuggestion.string = lastSuggestion.string + oldSuggestion.string
  //     } else {
  //       newSuggestions.push(oldSuggestion)
  //     }
  //   }
  // }
  // output.suggestion = newSuggestions
  //
  return output
}

export default class Parser extends EventEmitter {
  constructor({langs = ['default'], grammar, extensions = []} = {}) {
    super()

    this.langs = langs
    this.grammar = grammar
    this.extensions = extensions
    this._sources = []
    this._reparseNeeded = false
  }

  _getExtensions(Constructor) {
    return _.reduce(this.extensions, (acc, Extension) => {
      if (_.includes(Extension.extends, Constructor)) {
        acc.push(Extension)
      }
      return acc
    }, [])
  }

  _triggerReparse() {
    this._reparseNeeded = true
    process.nextTick(() => {
      if (this._reparseNeeded) {
        this._reparseNeeded = false
        this.emit('change')
      }
    })
  }

  _getSource(sourceDescriptor) {
    const possibleSource = _.find(this._sources, ({descriptor}) => _.isEqual(descriptor, sourceDescriptor))
    if (possibleSource) return possibleSource.instance

    const instance = new sourceDescriptor.Constructor()
    instance.props = sourceDescriptor.props

    instance.data = {}
    instance.__dataVersion = 0
    instance.__subscribers = 0
    instance.setData = newData => {
      _.merge(instance.data, newData)
      instance.__dataVersion++
      this._triggerReparse()
    }
    instance.replaceData = newData => {
      instance.data = newData
      instance.__dataVersion++
      this._triggerReparse()
    }

    if (instance.create) instance.create()

    this._sources.push({instance, descriptor: sourceDescriptor})
    return instance
  }

  _removeSource(sourceDescriptor) {
    const index = _.findIndex(this._sources, ({descriptor}) => _.isEqual(descriptor, sourceDescriptor))
    this._sources.splice(index, 1)
  }

  *parse(inputString) {
    if (!_.isString(inputString)) {
      throw new Error('lacona parse input must be a string')
    }

    const input = createOption({text: inputString})
    const options = {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this),
      getSource: this._getSource.bind(this),
      removeSource: this._removeSource.bind(this)
    }

    this._phrase = reconcile({descriptor: this.grammar, phrase: this._phrase, options})

    for (let output of parse({phrase: this._phrase, input, options})) {
      if (output.text === '') {
        // call each callback (used for limiting)
        output.callbacks.forEach(callback => callback())
        yield normalizeOutput(output)
      }
    }

    this._reparseNeeded = false
  }

  parseArray(inputString) {
    return from(this.parse(inputString))
  }
}
