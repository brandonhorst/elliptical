/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'lacona-phrase'
import {EventEmitter} from  'events'
import parse from './parse'
import reconcile from './reconcile'

const optionDefaults = {
  fuzzy: 'none',
  text: '',
  match: [],
  suggestion: [],
  completion: [],
  result: {},
  stack: [],
  callbacks: []
}

export function createOption(options) {
  return _.defaults(options, optionDefaults)
}

function normalizeOutput (option) {
  let output = _.pick(option, ['match', 'completion', 'result', 'sentence'])
  const suggestion = option.suggestion
  let newSuggestions = []
  let i, l, lastSuggestion, oldSuggestion

  if (suggestion.length > 0) {
    newSuggestions.push(_.clone(suggestion[0]))
    for (i = 1, l = suggestion.length; i < l; i++) {
      lastSuggestion = newSuggestions[newSuggestions.length - 1]
      oldSuggestion = _.clone(suggestion[i])
      if (lastSuggestion.input === oldSuggestion.input && lastSuggestion.category === oldSuggestion.category) {
        lastSuggestion.string = lastSuggestion.string + oldSuggestion.string
      } else {
        newSuggestions.push(oldSuggestion)
      }
    }
  }
  output.suggestion = newSuggestions

  return output
}

export default class Parser extends EventEmitter {
  constructor({langs = ['default'], sentences = [], extensions = [], fuzzy} = {}) {
    super()
    this.langs = langs
    this.sentences = sentences
    this.extensions = extensions
    this.fuzzy = fuzzy
  }

  _getExtensions(Constructor) {
    return _.reduce(this.extensions, (acc, Extension) => {
      if (_.includes(Extension.supplements, Constructor)) {
        acc.supplementers.push(Extension)
      }
      if (_.includes(Extension.overrides, Constructor)) {
        acc.overriders.push(Extension)
      }
      return acc
    }, {supplementers: [], overriders: []})
  }

  _triggerReparse() {
    this.emit('change')
  }

  *parse(inputString) {
    if (!_.isString(inputString)) {
      throw new Error('lacona parse input must be a string')
    }

    const sentences = _.map(this.sentences, sentence => _.merge({}, sentence, {props: {__sentence: true}}))
    const descriptor = <choice>{sentences}</choice>

    const input = createOption({fuzzy: this.fuzzy, text: inputString})
    const options = {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this),
      triggerReparse: this._triggerReparse.bind(this)
    }

    this._store = reconcile({descriptor, store: this._store, options})

    for (let output of parse({store: this._store, input, options})) {
      if (output.text === '') {
        // call each callback (used for limiting)
        output.callbacks.forEach(callback => callback())
        yield normalizeOutput(output)
      }
    }
  }
}
