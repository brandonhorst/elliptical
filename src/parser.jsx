/** @jsx createElement */
import _ from 'lodash'
import parse from './parse'
import {reconcile} from './reconcile'
import SourceManager from './sources'

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

export default class Parser {
  constructor ({langs = ['default'], grammar, extensions = [], reparse = () => {}} = {}) {
    this.langs = langs
    this.grammar = grammar
    this.extensions = extensions
    this.reparse = reparse
    this._currentlyParsing = false
    this._sourceManager = new SourceManager({
      update: this._maybeReparse.bind(this)
    })
  }

  _maybeReparse () {
    if (!this._currentlyParsing) {
      this.reparse()
    }
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

  _getReconcileParseOptions () {
    return {
      langs: this.langs,
      getExtensions: this._getExtensions.bind(this),
      getSource: this._getSource.bind(this),
      removeSource: this._removeSource.bind(this)
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

  * parse (inputString) {
    this._currentlyParsing = true
    if (!_.isString(inputString)) {
      throw new Error('lacona parse input must be a string')
    }

    const input = createOption({text: inputString})
    this.reconcile()

    const options = this._getReconcileParseOptions()
    for (let output of parse({phrase: this._phrase, input, options})) {
      if (output.text === '') {
        // call each callback (used for limiting)
        output.callbacks.forEach(callback => callback())
        yield normalizeOutput(output)
      }
    }

    this._currentlyParsing = false
  }

  parseArray (inputString) {
    return from(this.parse(inputString))
  }
}
